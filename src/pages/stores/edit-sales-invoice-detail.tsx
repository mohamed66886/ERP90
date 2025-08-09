import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { SearchOutlined } from '@ant-design/icons';
import { useAuth } from '@/contexts/useAuth';
import { doc, getDoc, collection, getDocs, addDoc, query, where, updateDoc } from 'firebase/firestore';
import { useParams, useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { Button, Input, Select, Table, message, Form, Row, Col, DatePicker, Spin, Modal, Space } from 'antd';
import * as XLSX from 'xlsx';
import Divider from 'antd/es/divider';
import Breadcrumb from "../../components/Breadcrumb";
import Card from 'antd/es/card';
import { PlusOutlined, SaveOutlined, UserOutlined, EditOutlined } from '@ant-design/icons';
import { db } from '@/lib/firebase';
import { FileText } from 'lucide-react';
import { fetchCashBoxes } from '../../services/cashBoxesService';
import { fetchBankAccounts } from '../../services/bankAccountsService';
import { useFinancialYear } from '@/hooks/useFinancialYear';
import { FinancialYear } from '@/services/financialYearsService';

// تعريف نوع العنصر
interface InventoryItem {
  id: string;
  name: string;
  itemCode?: string;
  salePrice?: number;
  discount?: number;
  isVatIncluded?: boolean;
  type?: string;
  tempCodes?: boolean;
  allowNegative?: boolean;
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
  isNewItem?: boolean; // إضافة خاصية تحديد إذا كان الصنف جديد
}

interface InvoiceData {
  invoiceNumber: string;
  entryNumber: string;
  date: string;
  paymentMethod: string;
  cashBox: string;
  multiplePayment: MultiplePayment;
  branch: string;
  warehouse: string;
  customerNumber: string;
  customerName: string;
  delegate: string;
  priceRule: string;
  commercialRecord: string;
  taxFile: string;
  dueDate?: string; // إضافة تاريخ الاستحقاق
}

interface Totals {
  afterDiscount: number;
  afterTax: number;
  total: number;
  tax: number;
}

interface Branch {
  id: string;
  name?: string;
  code?: string;
  number?: string;
  branchNumber?: string;
}

interface Warehouse {
  id: string;
  name?: string;
}

interface PaymentMethod {
  id: string;
  name?: string;
  value?: string;
}

interface Customer {
  id: string;
  nameAr?: string;
  nameEn?: string;
  name?: string;
  phone?: string;
  phoneNumber?: string;
  mobile?: string;
  commercialReg?: string;
  taxFile?: string;
  taxFileNumber?: string;
}

interface Delegate {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  status?: 'active' | 'inactive';
  uid?: string;
}

interface CashBox {
  id?: string;
  nameAr: string;
  nameEn: string;
  branch: string;
  mainAccount?: string;
  subAccountId?: string;
  subAccountCode?: string;
}

interface Bank {
  id?: string;
  arabicName: string;
  englishName: string;
  branch?: string;
  mainAccount?: string;
  subAccountId?: string;
  subAccountCode?: string;
}

interface MultiplePayment {
  cash?: {
    cashBoxId: string;
    amount: string;
  };
  bank?: {
    bankId: string;
    amount: string;
  };
  card?: {
    bankId: string;
    amount: string;
  };
}

interface Supplier {
  id: string;
  name: string;
}

interface ItemData {
  id?: string;
  name?: string;
  itemCode?: string;
  salePrice?: number;
  purchasePrice?: number;
  cost?: number;
  unit?: string;
  type?: string;
  parentId?: string;
  tempCodes?: boolean;
  [key: string]: unknown;
}

interface InvoiceRecord {
  key: string;
  invoiceNumber: string;
  entryNumber?: string;
  date: string;
  dueDate?: string; // إضافة تاريخ الاستحقاق
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
  customerNumber?: string;
  customerName?: string;
  customerPhone: string;
  seller: string;
  delegate?: string;
  paymentMethod: string;
  invoiceType: string;
  priceRule?: string;
  commercialRecord?: string;
  taxFile?: string;
  items?: InvoiceItem[];
  totals?: Totals;
  extraDiscount?: number;
  itemData?: ItemData; // لإظهار بيانات الصنف المؤقتة
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
  total: 0,
  isNewItem: false
}


// دالة توليد رقم فاتورة جديد بناءً على رقم الفرع والتاريخ والتسلسل اليومي
async function generateInvoiceNumberAsync(branchId: string, branches: Branch[] = []): Promise<string> {
  const date = new Date();
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const dateStr = `${y}${m}${d}`;
  
  // البحث عن رقم الفرع الحقيقي من بيانات الفروع
  const branchObj = branches.find(b => b.id === branchId);
  const branchNumber = branchObj?.code || branchObj?.number || branchObj?.branchNumber || '1';
  
  // جلب عدد الفواتير لنفس الفرع في نفس اليوم
  const { getDocs, collection, query, where } = await import('firebase/firestore');
  const q = query(
    collection(db, 'sales_invoices'),
    where('branch', '==', branchId),
    where('date', '==', `${y}-${m}-${d}`)
  );
  const snapshot = await getDocs(q);
  const count = snapshot.size + 1;
  const serial = count;
  
  return `INV-${branchNumber}-${dateStr}-${serial}`;
}

function getTodayString(): string {
  return dayjs().format('YYYY-MM-DD');
}

// دالة للحصول على تاريخ صالح ضمن السنة المالية
function getValidDateForFinancialYear(financialYear: FinancialYear | null): string {
  const today = dayjs();
  
  if (!financialYear) {
    return today.format('YYYY-MM-DD');
  }
  
  const startDate = dayjs(financialYear.startDate);
  const endDate = dayjs(financialYear.endDate);
  
  // إذا كان اليوم ضمن السنة المالية، استخدمه
  if (today.isSameOrAfter(startDate, 'day') && today.isSameOrBefore(endDate, 'day')) {
    return today.format('YYYY-MM-DD');
  }
  
  // إذا كان اليوم قبل بداية السنة المالية، استخدم تاريخ البداية
  if (today.isBefore(startDate, 'day')) {
    return startDate.format('YYYY-MM-DD');
  }
  
  // إذا كان اليوم بعد نهاية السنة المالية، استخدم تاريخ النهاية
  return endDate.format('YYYY-MM-DD');
}

// دالة حساب تاريخ الاستحقاق (بعد 12 يوم من تاريخ الفاتورة)
function calculateDueDate(invoiceDate: string): string {
  if (!invoiceDate) return '';
  return dayjs(invoiceDate).add(12, 'day').format('YYYY-MM-DD');
}

const EditSalesInvoiceDetailPage: React.FC = () => {
  const { id: invoiceId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loadingInvoice, setLoadingInvoice] = useState<boolean>(true);
  const [invoiceNotFound, setInvoiceNotFound] = useState<boolean>(false);

  // حالة الرسائل
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
    timestamp: Date;
  }>>([]);

  // دالة إضافة رسالة جديدة
  const addNotification = useCallback((type: 'success' | 'error' | 'warning' | 'info', title: string, msg: string) => {
    const newNotification = {
      id: Date.now().toString(),
      type,
      title,
      message: msg,
      timestamp: new Date()
    };
    setNotifications(prev => {
      // إضافة الرسالة الجديدة في المقدمة والاحتفاظ بآخر 4 رسائل فقط
      const updated = [newNotification, ...prev.slice(0, 3)];
      return updated;
    });
    
    // إزالة الرسالة تلقائياً بعد 5 ثواني
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== newNotification.id));
    }, 5000);
  }, []);

  // إنشاء كائن message مخصص
  const customMessage = useMemo(() => ({
    success: (msg: string) => {
      addNotification('success', 'نجح العملية', msg);
      message.success(msg);
    },
    error: (msg: string) => {
      addNotification('error', 'خطأ في العملية', msg);
      message.error(msg);
    },
    warning: (msg: string) => {
      addNotification('warning', 'تحذير', msg);
      message.warning(msg);
    },
    info: (msg: string) => {
      addNotification('info', 'معلومات', msg);
      message.info(msg);
    }
  }), [addNotification]);

  // زر توليد 3000 فاتورة عشوائية
  const generateRandomInvoices = async () => {
    if (!branches.length || !warehouses.length || !paymentMethods.length || !customers.length || !itemNames.length) {
      customMessage.error('يجب توفر بيانات الفروع والمخازن والعملاء والأصناف وطرق الدفع أولاً');
      return;
    }
    const { addDoc, collection } = await import('firebase/firestore');
    const randomFrom = arr => arr[Math.floor(Math.random() * arr.length)];
    const randomDiscount = () => Math.floor(Math.random() * 21); // 0-20%
    const randomQty = () => Math.floor(Math.random() * 10) + 1; // 1-10
    const today = getTodayString();
    setLoading(true);
    try {
      for (let i = 0; i < 3000; i++) {
        const branch = randomFrom(branches);
        const warehouse = randomFrom(warehouses);
        const paymentMethod = randomFrom(paymentMethods);
        const customer = randomFrom(customers);
        const item = randomFrom(itemNames);
        const discountPercent = randomDiscount();
        const quantity = randomQty();
        const price = item.salePrice || 10;
        const subtotal = price * quantity;
        const discountValue = subtotal * (discountPercent / 100);
        const taxableAmount = subtotal - discountValue;
        const taxPercent = 15;
        const taxValue = taxableAmount * (taxPercent / 100);
        const total = subtotal;
        const invoiceNumber = `RND-${branch.id}-${today.replace(/-/g, '')}-${i+1}`;
        const invoiceData = {
          invoiceNumber,
          entryNumber: `EN-${Math.floor(100000 + Math.random() * 900000)}`,
          date: today,
          paymentMethod: paymentMethod.name || paymentMethod.value || paymentMethod,
          branch: branch.id,
          warehouse: warehouse.id,
          customerNumber: customer.phone || customer.phoneNumber || '',
          customerName: customer.nameAr || customer.name || customer.nameEn || '',
          delegate: '',
          priceRule: '',
          commercialRecord: customer.commercialReg || '',
          taxFile: customer.taxFileNumber || customer.taxFile || '',
          items: [
            {
              itemNumber: item.itemCode || '',
              itemName: item.name,
              quantity: String(quantity),
              unit: item.unit || 'قطعة',
              price: String(price),
              discountPercent: String(discountPercent),
              discountValue,
              taxPercent: String(taxPercent),
              taxValue,
              total,
              isNewItem: false
            }
          ],
          totals: {
            afterDiscount: subtotal - discountValue,
            afterTax: taxableAmount + taxValue,
            total: subtotal,
            tax: taxValue
          },
          type: 'ضريبة'
        };
        await addDoc(collection(db, 'sales_invoices'), invoiceData);
      }
      customMessage.success('تم توليد 3000 فاتورة عشوائية بنجاح');
    } catch (err) {
      customMessage.error('حدث خطأ أثناء توليد الفواتير');
    } finally {
      setLoading(false);
    }
  };
  // حالة مودال إضافة صنف جديد
  const [showAddItemModal, setShowAddItemModal] = useState(false);

  // قائمة الموردين
  const [suppliers, setSuppliers] = useState<{ id: string; name: string }[]>([]);
  const [addItemLoading, setAddItemLoading] = useState(false);

  // جلب الموردين من قاعدة البيانات عند تحميل الصفحة
  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const suppliersSnapshot = await getDocs(collection(db, 'suppliers'));
        const suppliersData = suppliersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...(doc.data() as { name: string })
        }));
        // فقط الاسم والمعرف
        setSuppliers(suppliersData.map(s => ({ id: s.id, name: s.name })));
      } catch (error) {
        console.error('Error fetching suppliers:', error);
      }
    };
    fetchSuppliers();
  }, []);

  // دالة إضافة صنف جديد
  const handleAddNewItem = async () => {
    if (!addItemForm.name.trim() || !addItemForm.salePrice.trim() || !addItemForm.unit.trim()) return;
    setAddItemLoading(true);
    try {
      // بناء بيانات الصنف الجديد
      const newItem: InventoryItem = {
        id: `temp_${Date.now()}`, // معرف مؤقت
        name: addItemForm.name.trim(),
        itemCode: addItemForm.itemCode?.trim() || '',
        salePrice: addItemForm.salePrice ? Number(addItemForm.salePrice) : 0,
        discount: addItemForm.discount ? Number(addItemForm.discount) : 0,
        isVatIncluded: !!addItemForm.isVatIncluded,
        tempCodes: !!addItemForm.tempCodes,
        type: 'مستوى ثاني'
      };

      // إضافة الصنف إلى قاعدة البيانات (صفحة الأصناف)
      try {
        const { addDoc, collection } = await import('firebase/firestore');
        await addDoc(collection(db, 'inventory_items'), newItem);
      } catch (err) {
        console.error('خطأ في حفظ الصنف في قاعدة البيانات:', err);
        if (typeof message !== 'undefined' && message.error) {
          message.error('حدث خطأ أثناء حفظ الصنف في قاعدة البيانات');
        }
      }

      // تحديث القوائم المحلية
      if (typeof setItemNames === 'function') {
        setItemNames((prev: InventoryItem[]) => [...prev, newItem]);
      }
      if (typeof setAllItems === 'function') {
        setAllItems((prev: InventoryItem[]) => [...prev, newItem]);
      }
      setShowAddItemModal(false);
      setAddItemForm({
        name: '',
        itemCode: '',
        purchasePrice: '',
        salePrice: '',
        minOrder: '',
        discount: '',
        allowNegative: false,
        isVatIncluded: false,
        tempCodes: false,
        supplier: '',
        unit: '',
        type: '',
        parentId: ''
      });
      if (typeof customMessage !== 'undefined' && customMessage.success) {
        customMessage.success('تمت إضافة الصنف بنجاح');
      }
    } catch (e) {
      if (typeof message !== 'undefined' && message.error) {
        message.error('حدث خطأ أثناء إضافة الصنف');
      }
    } finally {
      setAddItemLoading(false);
    }
  };
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
      customMessage.success('تم إضافة العميل بنجاح! يمكنك تعديل باقي البيانات من صفحة العملاء.');
      setShowAddCustomerModal(false);
      setAddCustomerForm(initialAddCustomer);
      // Optionally, you can refresh the customers list here if you have a fetchCustomers function available
    } catch (err) {
      message.error('حدث خطأ أثناء إضافة العميل');
    } finally {
      setAddCustomerLoading(false);
    }
  };
interface CompanyData {
  arabicName?: string;
  englishName?: string;
  logoUrl?: string;
  commercialRegistration?: string;
  taxFile?: string;
  registrationDate?: string;
  issuingAuthority?: string;
  companyType?: string;
  activityType?: string;
  nationality?: string;
  city?: string;
  region?: string;
  street?: string;
  district?: string;
  buildingNumber?: string;
  postalCode?: string;
  countryCode?: string;
  phone?: string;
  mobile?: string;
  fiscalYear?: string;
  taxRate?: string;
  website?: string;
}

  // بيانات الشركة
  const [companyData, setCompanyData] = useState<CompanyData>({});
  
  const { user } = useAuth();
  const [invoiceType, setInvoiceType] = useState<'ضريبة مبسطة' | 'ضريبة'>('ضريبة مبسطة');
  const [warehouseMode, setWarehouseMode] = useState<'single' | 'multiple'>('single');
  const [multiplePaymentMode, setMultiplePaymentMode] = useState<boolean>(false);
  const [branchCode, setBranchCode] = useState<string>('');
  const [invoiceData, setInvoiceData] = useState<InvoiceData>({
    invoiceNumber: '',
    entryNumber: generateEntryNumber(),
    date: getTodayString(),
    paymentMethod: '',
    cashBox: '',
    multiplePayment: {},
    branch: '',
    warehouse: '',
    customerNumber: '',
    customerName: '',
    delegate: '', // سيتم تعيين المندوب المناسب في useEffect
    priceRule: '',
    commercialRecord: '',
    taxFile: '',
    dueDate: '' // سيتم حسابه لاحقاً
  });

  // توليد رقم فاتورة جديد عند كل إعادة تعيين أو تغيير الفرع
  // دالة توليد رقم قيد تلقائي
  function generateEntryNumber() {
    // رقم عشوائي بين 100000 و 999999
    return 'EN-' + Math.floor(100000 + Math.random() * 900000);
  }

  const generateAndSetInvoiceNumber = async (branchIdValue: string) => {
    const invoiceNumber = await generateInvoiceNumberAsync(branchIdValue, branches);
    setInvoiceData(prev => ({ ...prev, invoiceNumber, entryNumber: generateEntryNumber() }));
  };

  // توليد رقم فاتورة عند تحميل الصفحة لأول مرة إذا كان رقم الفرع موجود
  useEffect(() => {
    if (branchCode) {
      generateAndSetInvoiceNumber(branchCode);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [branchCode]);
  
  // استخدام hook السنة المالية
  const { 
    currentFinancialYear, 
    validateDate, 
    getDateValidationMessage, 
    getMinDate, 
    getMaxDate,
    isWithinFinancialYear 
  } = useFinancialYear();
  
  const [delegates, setDelegates] = useState<Delegate[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [cashBoxes, setCashBoxes] = useState<CashBox[]>([]);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [priceRules, setPriceRules] = useState<string[]>([]);
  const [units, setUnits] = useState<string[]>([]);
  const [itemNames, setItemNames] = useState<InventoryItem[]>([]);
  const [allItems, setAllItems] = useState<InventoryItem[]>([]); // جميع الأصناف للاستخدام في النماذج
  const [customers, setCustomers] = useState<Customer[]>([]);
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

  // دالة تحميل بيانات الفاتورة المحددة
  const loadInvoiceData = useCallback(async () => {
    if (!invoiceId) {
      setInvoiceNotFound(true);
      setLoadingInvoice(false);
      return;
    }

    try {
      setLoadingInvoice(true);
      
      // البحث في قاعدة البيانات عن الفاتورة
      const invoiceDoc = await getDoc(doc(db, 'sales_invoices', invoiceId));
      
      if (!invoiceDoc.exists()) {
        setInvoiceNotFound(true);
        addNotification('error', 'خطأ', 'لم يتم العثور على الفاتورة المطلوبة');
        return;
      }

      const invoiceData = invoiceDoc.data();
      
      // تعبئة بيانات الفاتورة في النموذج
      setInvoiceData({
        invoiceNumber: invoiceData.invoiceNumber || '',
        entryNumber: invoiceData.entryNumber || '',
        date: invoiceData.date || '',
        paymentMethod: invoiceData.paymentMethod || '',
        cashBox: invoiceData.cashBox || '',
        multiplePayment: invoiceData.multiplePayment || {},
        branch: invoiceData.branch || '',
        warehouse: invoiceData.warehouse || '',
        customerNumber: invoiceData.customerNumber || '',
        customerName: invoiceData.customerName || '',
        delegate: invoiceData.delegate || '',
        priceRule: invoiceData.priceRule || '',
        commercialRecord: invoiceData.commercialRecord || '',
        taxFile: invoiceData.taxFile || '',
        dueDate: invoiceData.dueDate || ''
      });

      // تعبئة الأصناف
      setItems(invoiceData.items || []);
      
      // تعبئة الإجماليات
      setTotals(invoiceData.totals || {
        afterDiscount: 0,
        afterTax: 0,
        total: 0,
        tax: 0
      });

      // تعيين نوع الفاتورة
      if (invoiceData.type) {
        setInvoiceType(invoiceData.type);
      }

      // تعيين وضع الدفع المتعدد
      if (invoiceData.multiplePayment && Object.keys(invoiceData.multiplePayment).length > 0) {
        setMultiplePaymentMode(true);
      }

      addNotification('success', 'نجح', 'تم تحميل بيانات الفاتورة بنجاح');
      
    } catch (error) {
      console.error('Error loading invoice:', error);
      addNotification('error', 'خطأ', 'حدث خطأ في تحميل بيانات الفاتورة');
    } finally {
      setLoadingInvoice(false);
    }
  }, [invoiceId, addNotification]);

  // تحميل بيانات الفاتورة عند تحميل الصفحة
  useEffect(() => {
    loadInvoiceData();
  }, [loadInvoiceData]);

  const [taxRate, setTaxRate] = useState<string>('15');
  const [priceType, setPriceType] = useState<'سعر البيع' | 'آخر سعر العميل'>('سعر البيع');
interface FirebaseInvoiceItem {
  itemNumber?: string;
  itemName?: string;
  quantity?: string | number;
  price?: string | number;
  total?: string | number;
  discountValue?: string | number;
  discountPercent?: string | number;
  taxValue?: string | number;
  taxPercent?: string | number;
  cost?: string | number;
  [key: string]: unknown;
}

interface SavedInvoice {
  invoiceNumber: string;
  entryNumber: string;
  date: string;
  paymentMethod: string;
  cashBox?: string;
  multiplePayment?: MultiplePayment;
  branch: string;
  warehouse: string;
  customerNumber: string;
  customerName: string;
  delegate: string;
  priceRule: string;
  commercialRecord: string;
  taxFile: string;
  items: InvoiceItem[];
  totals: Totals;
  type: string;
  createdAt: string;
  source: string;
  dueDate?: string;
  customerAddress?: string;
  [key: string]: unknown;
}

  // حالة المودال بعد الحفظ
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [lastSavedInvoice, setLastSavedInvoice] = useState<SavedInvoice | null>(null);

  // حالة تتبع الصنف المحدد للتعديل
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);

  // دالة للتحقق من حالة الإيقاف المؤقت للصنف
  const checkItemTempStatus = (itemName: string): boolean => {
    const item = itemNames.find(i => i.name === itemName);
    return item ? !!item.tempCodes : false;
  };

  const [itemStocks, setItemStocks] = useState<{[key: string]: number}>({});
  const [loadingStocks, setLoadingStocks] = useState(false);

  // دالة للتحقق من صحة التاريخ وإظهار التحذير
  const handleDateValidation = useCallback((date: string | dayjs.Dayjs, fieldName: string) => {
    if (!date) return true;
    
    const isValid = validateDate(date);
    if (!isValid && currentFinancialYear) {
      const errorMessage = getDateValidationMessage(date);
      customMessage.warning(
        `${fieldName}: ${errorMessage}. السنة المالية المحددة من ${currentFinancialYear.startDate} إلى ${currentFinancialYear.endDate}`
      );
      return false;
    }
    return true;
  }, [validateDate, getDateValidationMessage, currentFinancialYear, customMessage]);

  // دالة لحساب تاريخ الاستحقاق مع التحقق من السنة المالية
  const calculateDueDate = useCallback((invoiceDate: string): string => {
    if (!invoiceDate) return '';
    
    // حساب تاريخ الاستحقاق بعد 30 يوم من تاريخ الفاتورة
    const dueDate = dayjs(invoiceDate).add(30, 'day');
    
    // التحقق من أن تاريخ الاستحقاق ضمن السنة المالية
    if (currentFinancialYear) {
      const maxDate = dayjs(currentFinancialYear.endDate);
      if (dueDate.isAfter(maxDate)) {
        // إذا كان تاريخ الاستحقاق المحسوب خارج السنة المالية، استخدم آخر يوم في السنة المالية
        return maxDate.format('YYYY-MM-DD');
      }
    }
    
    return dueDate.format('YYYY-MM-DD');
  }, [currentFinancialYear]);

  // دالة لفلترة التواريخ المسموحة في DatePicker
  const disabledDate = useCallback((current: dayjs.Dayjs) => {
    if (!currentFinancialYear) return false;
    
    const startDate = dayjs(currentFinancialYear.startDate);
    const endDate = dayjs(currentFinancialYear.endDate);
    
    return current.isBefore(startDate, 'day') || current.isAfter(endDate, 'day');
  }, [currentFinancialYear]);

  // تحديث التاريخ الافتراضي عند تغيير السنة المالية
  useEffect(() => {
    if (currentFinancialYear) {
      const validDate = getValidDateForFinancialYear(currentFinancialYear);
      setInvoiceData(prev => ({
        ...prev,
        date: validDate,
        dueDate: calculateDueDate(validDate)
      }));
    }
  }, [currentFinancialYear, calculateDueDate]);

  // دالة لجلب رصيد صنف واحد في مخزن محدد (للاستخدام في حالة المخازن المتعددة)
  const fetchSingleItemStock = async (itemName: string, warehouseId: string): Promise<number> => {
    if (!itemName || !warehouseId) return 0;
    
    try {
      const stock = await checkStockAvailability(itemName, warehouseId);
      // تحديث الرصيد في الحالة
      setItemStocks(prev => ({
        ...prev,
        [`${itemName}-${warehouseId}`]: stock
      }));
      return stock;
    } catch (error) {
      console.error('خطأ في جلب رصيد الصنف:', error);
      return 0;
    }
  };

  // دالة لجلب أرصدة جميع الأصناف في المخزن المحدد
  const fetchItemStocks = useCallback(async (warehouseId: string) => {
    if (!warehouseId || itemNames.length === 0) return;
    
    setLoadingStocks(true);
    const stocks: {[key: string]: number} = {};
    
    try {
      // جلب الأرصدة لجميع الأصناف بشكل متوازي
      const stockPromises = itemNames.map(async (item) => {
        const stock = await checkStockAvailability(item.name, warehouseId);
        stocks[item.name] = stock;
      });
      
      await Promise.all(stockPromises);
      setItemStocks(stocks);
    } catch (error) {
      console.error('خطأ في جلب الأرصدة:', error);
    } finally {
      setLoadingStocks(false);
    }
  }, [itemNames]);

  // تحديث الأرصدة عند تغيير المخزن أو الأصناف
  useEffect(() => {
    if (warehouseMode === 'single' && invoiceData.warehouse) {
      fetchItemStocks(invoiceData.warehouse);
    }
  }, [invoiceData.warehouse, itemNames, warehouseMode, fetchItemStocks]);

  // دالة فحص المخزون المتاح
  const checkStockAvailability = async (itemName: string, warehouseId: string): Promise<number> => {
    try {
      // جلب فواتير المشتريات (وارد)
      const purchasesSnap = await getDocs(collection(db, "purchases_invoices"));
      const allPurchases = purchasesSnap.docs.map(doc => doc.data());
      
      // جلب فواتير المبيعات (منصرف)
      const salesSnap = await getDocs(collection(db, "sales_invoices"));
      const allSales = salesSnap.docs.map(doc => doc.data());
      
      // جلب مرتجعات المبيعات (وارد)
      const salesReturnsSnap = await getDocs(collection(db, "sales_returns"));
      const allSalesReturns = salesReturnsSnap.docs.map(doc => doc.data());
      
      let totalIncoming = 0;
      let totalOutgoing = 0;
      
      // حساب الوارد من المشتريات
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      allPurchases.forEach((purchase: any) => {
        if (Array.isArray(purchase.items)) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          purchase.items.forEach((item: any) => {
            if ((item.itemName === itemName) && 
                ((purchase.warehouse === warehouseId) || (item.warehouseId === warehouseId))) {
              totalIncoming += Number(item.quantity) || 0;
            }
          });
        }
      });
      
      // حساب الوارد من مرتجعات المبيعات
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      allSalesReturns.forEach((returnDoc: any) => {
        if (Array.isArray(returnDoc.items)) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          returnDoc.items.forEach((item: any) => {
            const returnWarehouse = item.warehouseId || item.warehouse || returnDoc.warehouse;
            if ((item.itemName === itemName) && (returnWarehouse === warehouseId)) {
              const returnedQty = typeof item.returnedQty !== 'undefined' ? Number(item.returnedQty) : 0;
              totalIncoming += returnedQty;
            }
          });
        }
      });
      
      // حساب المنصرف من المبيعات
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      allSales.forEach((sale: any) => {
        if (Array.isArray(sale.items)) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          sale.items.forEach((item: any) => {
            if ((item.itemName === itemName) && 
                ((sale.warehouse === warehouseId) || (item.warehouseId === warehouseId))) {
              totalOutgoing += Number(item.quantity) || 0;
            }
          });
        }
      });
      
      return totalIncoming - totalOutgoing;
    } catch (error) {
      console.error('خطأ في فحص المخزون:', error);
      return 0;
    }
  };

  // جلب نسبة الضريبة من إعدادات الشركة (companies)
  useEffect(() => {
    const fetchTaxRate = async () => {
      try {
        const companiesSnap = await getDocs(collection(db, 'companies'));
        if (!companiesSnap.empty) {
          const companyData = companiesSnap.docs[0].data();
          if (companyData.taxRate) {
            const newTaxRate = String(companyData.taxRate);
            setTaxRate(newTaxRate);
            // تحديث الصنف الحالي بنسبة الضريبة الجديدة
            setItem(prev => ({ ...prev, taxPercent: newTaxRate }));
          }
        }
      } catch (err) {
        console.error('Failed to fetch tax rate from company settings:', err);
      }
    };
    fetchTaxRate();
  }, []);

  // تحديث الصنف عند تحميل الصفحة بنسبة الضريبة
  useEffect(() => {
    setItem(prev => ({ ...prev, taxPercent: taxRate }));
  }, [taxRate]);

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
        .flatMap(inv => inv.items.filter((it: FirebaseInvoiceItem) => it.itemName === itemName))
        .sort((a: FirebaseInvoiceItem, b: FirebaseInvoiceItem) => new Date(String(b.date || '')).getTime() - new Date(String(a.date || '')).getTime());
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
    // استخدام نسبة الضريبة من إعدادات الشركة
    const taxPercent = Math.max(0, Number(taxRate) || 0);
    
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

  const addItem = async () => {
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

    // Prevent adding items with tempCodes (إيقاف مؤقت) by name or code
    const possibleItems = itemNames.filter(i => i.name === item.itemName || i.itemCode === item.itemNumber);
    if (possibleItems.length === 0) {
      message.info('الصنف غير موجود في قائمة الأصناف!');
      return;
    }
    const stoppedItem = possibleItems.find(i => i.tempCodes === true || String(i.tempCodes).toLowerCase() === 'true');
    if (stoppedItem) {
      console.warn('[SALES] محاولة إضافة صنف موقف مؤقت:', {
        itemName: item.itemName,
        itemNumber: item.itemNumber,
        stoppedItem
      });
      customMessage.warning(`الصنف "${stoppedItem.name}" موقوف مؤقتاً ولا يمكن إضافته للفاتورة`);
      return;
    }

    const selected = possibleItems[0];
    
    // فحص المخزون والسماح بالسالب
    if (!selected.allowNegative) {
      // فحص الكمية المتاحة في المخزون
      const requestedQuantity = Number(item.quantity);
      const warehouseToCheck = warehouseMode === 'multiple' ? item.warehouseId : invoiceData.warehouse;
      
      // فحص المخزون الفعلي
      const availableStock = await checkStockAvailability(item.itemName, warehouseToCheck || '');
      
      if (requestedQuantity > availableStock) {
        customMessage.warning(`الكمية المطلوبة (${requestedQuantity}) أكبر من المتاح في المخزون (${availableStock}) والصنف لا يسمح بالسالب`);
        return;
      }
    }
    
    const { discountValue, taxValue, total } = calculateItemValues(item);
    const mainCategory = selected?.type || '';
    // إذا كان يوجد cost في بيانات الصنف
    const cost = selected && 'cost' in selected && typeof selected.cost !== 'undefined' ? Number(selected.cost) : 0;

    const newItem: InvoiceItem & { warehouseId?: string; mainCategory?: string; cost?: number } = {
      ...item,
      itemNumber: item.itemNumber || 'N/A',
      taxPercent: taxRate, // استخدام نسبة الضريبة من إعدادات الشركة
      discountValue,
      taxValue,
      total,
      mainCategory,
      cost
    };

    let newItems: InvoiceItem[];
    
    // التحقق من أننا في وضع التعديل أم الإضافة
    if (editingItemIndex !== null) {
      // في وضع التعديل - نحديث الصنف الموجود
      newItems = [...items];
      newItems[editingItemIndex] = newItem;
      setEditingItemIndex(null); // إعادة تعيين حالة التعديل
      customMessage.success('تم تحديث الصنف بنجاح');
    } else {
      // في وضع الإضافة - نضيف صنف جديد
      newItems = [...items, newItem];
      customMessage.success('تم إضافة الصنف بنجاح');
    }
    
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
      customMessage.error('لا يمكن حفظ فاتورة بدون أصناف');
      return;
    }

    if (!invoiceId) {
      customMessage.error('معرف الفاتورة غير موجود');
      return;
    }
    
    // التحقق من صحة التواريخ
    if (invoiceData.date && !validateDate(invoiceData.date)) {
      customMessage.error(`تاريخ الفاتورة خارج نطاق السنة المالية. ${getDateValidationMessage(invoiceData.date)}`);
      return;
    }
    
    if (invoiceData.dueDate && !validateDate(invoiceData.dueDate)) {
      customMessage.error(`تاريخ الاستحقاق خارج نطاق السنة المالية. ${getDateValidationMessage(invoiceData.dueDate)}`);
      return;
    }
    
    // التحقق من الصندوق النقدي إذا كانت طريقة الدفع نقدي
    if (invoiceData.paymentMethod === 'نقدي' && !invoiceData.cashBox) {
      message.error('يجب اختيار الصندوق النقدي عند اختيار الدفع النقدي');
      return;
    }
    
    // التحقق من الدفع المتعدد
    if (multiplePaymentMode) {
      const cashAmount = parseFloat(invoiceData.multiplePayment.cash?.amount || '0');
      const bankAmount = parseFloat(invoiceData.multiplePayment.bank?.amount || '0');
      const cardAmount = parseFloat(invoiceData.multiplePayment.card?.amount || '0');
      const totalPayment = cashAmount + bankAmount + cardAmount;
      const invoiceTotal = totals.afterTax;
      
      if (Math.abs(totalPayment - invoiceTotal) > 0.01) {
        message.error(`مجموع المبالغ (${totalPayment.toFixed(2)}) لا يساوي إجمالي الفاتورة (${invoiceTotal.toFixed(2)})`);
        return;
      }
      
      if (totalPayment === 0) {
        message.error('يجب إدخال مبلغ واحد على الأقل في الدفع المتعدد');
        return;
      }
    }
    
    setLoading(true);
    // حذف الحقول الفارغة من بيانات الفاتورة
    const cleanInvoiceData = Object.fromEntries(
      Object.entries(invoiceData).filter(([_, v]) => v !== '' && v !== undefined && v !== null)
    );
    // توحيد اسم طريقة الدفع مع قائمة طرق الدفع
    let paymentMethodName = cleanInvoiceData.paymentMethod;
    const paymentNames = paymentMethods.map(m => m.name || m.id);
    if (!paymentNames.includes(paymentMethodName)) {
      // إذا لم تكن القيمة موجودة، اختر أول طريقة دفع كافتراضي أو اتركها فارغة
      paymentMethodName = paymentNames[0] || '';
    }
    const invoice: Partial<SavedInvoice> & { updatedAt: string; source: string } = {
      ...cleanInvoiceData,
      paymentMethod: paymentMethodName,
      items,
      totals: {
        ...totals
      },
      type: invoiceType,
      updatedAt: new Date().toISOString(),
      source: 'sales'
    };

    // Add multiplePayment only if multiplePaymentMode is true
    if (multiplePaymentMode && invoiceData.multiplePayment) {
      invoice.multiplePayment = invoiceData.multiplePayment;
    }
    try {
      // تحديث الفاتورة في Firestore
      await updateDoc(doc(db, 'sales_invoices', invoiceId), invoice);
      customMessage.success('تم تحديث الفاتورة بنجاح!');
      
      // تحديث الأرصدة بعد التحديث
      if (warehouseMode === 'single' && invoiceData.warehouse) {
        await fetchItemStocks(invoiceData.warehouse);
      } else if (warehouseMode === 'multiple') {
        // في حالة المخازن المتعددة، تحديث رصيد كل صنف في مخزنه
        for (const savedItem of items) {
          const itemWithWarehouse = savedItem as InvoiceItem & { warehouseId?: string };
          if (itemWithWarehouse.warehouseId && itemWithWarehouse.itemName) {
            await fetchSingleItemStock(itemWithWarehouse.itemName, itemWithWarehouse.warehouseId);
          }
        }
      }
      
      // إظهار مودال الطباعة بعد الحفظ
      setLastSavedInvoice(invoice as SavedInvoice);
      setShowPrintModal(true);
      
    } catch (err) {
      console.error('Error updating invoice:', err);
      customMessage.error('حدث خطأ أثناء تحديث الفاتورة');
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
      render: (_: string | undefined, record: InvoiceItem & { warehouseId?: string }) => {
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
      render: (_: unknown, record: InvoiceItem) => {
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
      render: (_: unknown, record: InvoiceItem) => {
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
      width: 140,
      align: 'center' as const,
      render: (_: unknown, record: InvoiceItem, index: number) => (
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
          <Button
            type="text"
            size="small"
            onClick={() => handleEditItem(record, index)}
            style={{
              color: '#1890ff',
              transition: 'transform 0.2s',
            }}
            icon={
              <span style={{ display: 'inline-block', transition: 'transform 0.2s' }} className="action-icon-edit">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1890ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19.5 3 21l1.5-4L16.5 3.5z"/></svg>
              </span>
            }
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.transform = 'scale(1.15)'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.transform = 'scale(1)'}
          />
          {(
            <Button
              type="text"
              size="small"
              danger
              onClick={() => {
                const newItems = items.filter((_, i) => i !== index);
                setItems(newItems);
                updateTotals(newItems);
              }}
              style={{
                transition: 'transform 0.2s',
              }}
              icon={
                <span style={{ display: 'inline-block', transition: 'transform 0.2s' }} className="action-icon-delete">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ff4d4f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                </span>
              }
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.transform = 'scale(1.15)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.transform = 'scale(1)'}
            />
          )}
        </div>
      )
    }
  ];

  // دالة تعبئة بيانات الصنف عند التعديل
  const handleEditItem = (record: InvoiceItem, index: number) => {
    setItem({
      ...record,
      taxPercent: taxRate // استخدام نسبة الضريبة من إعدادات الشركة
    });
    // تحديد الصنف المحدد للتعديل بدلاً من حذفه
    setEditingItemIndex(index);
  };

  const handleEditInvoice = (record: InvoiceRecord & { firstLevelCategory?: string }) => {
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
      dueDate: record.dueDate || calculateDueDate(record.date || '') // إضافة تاريخ الاستحقاق أو حسابه من التاريخ
    });
    setItems(record.items || []);
    setTotals(record.totals || totals);
    setLastSavedInvoice(record as unknown as SavedInvoice);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // (الأعمدة الخاصة بسجل الفواتير تم حذفها لأنها غير مطلوبة في صفحة التعديل)

  // تعريف الدالة خارج useEffect
  const fetchLists = useCallback(async () => {
    try {
      setFetchingItems(true);
      // جلب الفروع
      const branchesSnap = await getDocs(collection(db, 'branches'));
      setBranches(branchesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      // جلب طرق الدفع
      const paymentSnap = await getDocs(collection(db, 'paymentMethods'));
      setPaymentMethods(paymentSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      // جلب الصناديق النقدية
      const cashBoxesData = await fetchCashBoxes();
      setCashBoxes(cashBoxesData);
      // جلب البنوك
      const banksData = await fetchBankAccounts();
      setBanks(banksData);
      // جلب العملاء من صفحة العملاء (collection: 'customers')
      const customersSnap = await getDocs(collection(db, 'customers'));
      setCustomers(customersSnap.docs.map(doc => {
        const data = doc.data();
        return { id: doc.id, ...data, taxFile: data.taxFile || '' };
      }));
      // جلب المخازن
      const warehousesSnap = await getDocs(collection(db, 'warehouses'));
      setWarehouses(warehousesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      // جلب البائعين النشطين فقط
      console.log('جاري تحميل المندوبين من قاعدة البيانات...');
      const delegatesQuery = query(
        collection(db, 'salesRepresentatives'),
        where('status', '==', 'active')
      );
      const delegatesSnap = await getDocs(delegatesQuery);
      const delegatesData = delegatesSnap.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      }));
      console.log('تم تحميل المندوبين بنجاح:', delegatesData.length, 'مندوب');
      // console.log('قائمة المندوبين:', delegatesData.map(d => ({ 
      //   id: d.id, 
      //   name: d.name || '', 
      //   email: d.email || '', 
      //   uid: d.uid || '' 
      // })));
      setDelegates(delegatesData as Delegate[]);
      // قوائم ثابتة
      setUnits(['قطعة', 'كرتونة', 'كيلو', 'جرام', 'لتر', 'متر', 'علبة']);
      setPriceRules(['السعر العادي', 'سعر الجملة', 'سعر التخفيض']);
      // جلب الأصناف
      const itemsSnap = await getDocs(collection(db, 'inventory_items'));
      const allItemsData = itemsSnap.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name || '',
          itemCode: data.itemCode || '',
          salePrice: data.salePrice || 0,
          discount: data.discount || 0,
          isVatIncluded: data.isVatIncluded || false,
          type: data.type || '',
          tempCodes: data.tempCodes || false,
          allowNegative: data.allowNegative || false
        };
      }).filter(item => item.name);
      
      // حفظ جميع الأصناف للاستخدام في النماذج
      setAllItems(allItemsData);
      
      // فلترة أصناف المستوى الثاني للعرض في قائمة المبيعات (مع الموقوفة مؤقتاً للإشارة)
      const secondLevelItems = allItemsData.filter(item => item.type === 'مستوى ثاني');
      setItemNames(secondLevelItems);
    } catch (err) {
      console.error('Error fetching lists:', err);
      customMessage.error('تعذر تحميل القوائم من قاعدة البيانات');
    } finally {
      setFetchingItems(false);
    }
  }, [customMessage]);
  useEffect(() => {
    fetchLists();
  }, [fetchLists]);

  // تحديد المندوب الافتراضي بناءً على المستخدم الحالي
  useEffect(() => {
    console.log('useEffect للمندوب الافتراضي - المندوبين:', delegates.length, 'المستخدم UID:', user?.uid, 'المندوب الحالي:', invoiceData.delegate);
    if (delegates.length > 0 && user?.uid && !invoiceData.delegate) {
      // البحث عن المندوب المطابق للمستخدم الحالي
      const currentUserDelegate = delegates.find(delegate => delegate.uid === user.uid);
      if (currentUserDelegate) {
        console.log('تم العثور على المندوب المطابق للمستخدم:', currentUserDelegate.name);
        setInvoiceData(prev => ({
          ...prev,
          delegate: currentUserDelegate.id
        }));
      } else {
        // في حالة عدم العثور على مندوب مطابق، اختر أول مندوب نشط
        const firstActiveDelegate = delegates.find(delegate => delegate.status === 'active');
        if (firstActiveDelegate) {
          console.log('تم اختيار أول مندوب نشط:', firstActiveDelegate.name);
          setInvoiceData(prev => ({
            ...prev,
            delegate: firstActiveDelegate.id
          }));
        } else {
          console.log('لم يتم العثور على أي مندوب نشط');
        }
      }
    }
  }, [delegates, user?.uid, invoiceData.delegate]);

  // دالة للحصول على اسم المندوب من ID
  const getDelegateName = (delegateId: string) => {
    if (!delegateId) return '';
    const delegate = delegates.find(d => d.id === delegateId);
    const name = delegate?.name || delegate?.email || delegateId;
    console.log('البحث عن مندوب بـ ID:', delegateId, 'النتيجة:', name);
    return name;
  };

  // حساب الإجماليات باستخدام useMemo لتحسين الأداء
  const totalsDisplay = useMemo(() => ({
    total: totals.total.toFixed(2),
    discount: (totals.total - totals.afterDiscount).toFixed(2),
    afterDiscount: totals.afterDiscount.toFixed(2),
    tax: totals.tax.toFixed(2), // الضريبة الفعلية
    net: totals.afterTax.toFixed(2) // الصافي = الاجمالي بعد الخصم + الضريبة
  }), [totals]);

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
      let companyData: CompanyData = {
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
      } catch {
        // Ignore error silently
      }

      const invoice = lastSavedInvoice;
      if (!invoice) {
        message.error('لا توجد فاتورة للطباعة');
        return;
      }

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

      // إنشاء عنصر div مخفي للطباعة
      const printContainer = document.createElement('div');
      printContainer.id = 'print-container';
      printContainer.style.position = 'absolute';
      printContainer.style.left = '-9999px';
      printContainer.style.top = '-9999px';
      printContainer.style.width = '210mm';
      printContainer.style.height = 'auto';
      
      // إضافة محتوى الفاتورة
      printContainer.innerHTML = `
        <html>
        <head>
          <title>فاتورة ضريبية | Tax Invoice</title>
          <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700&display=swap" rel="stylesheet">
          <style>
            @page { size: A4; margin: 10mm; }
            @media print {
              body { margin: 0; padding: 5mm; }
              * { -webkit-print-color-adjust: exact; color-adjust: exact; }
            }
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
            .policy { font-size: 10px; border: 1px solid #ddd; padding: 3mm; }
            .policy-title { font-weight: bold; margin-bottom: 2mm; }
            .signature { margin-top: 5mm; display: flex; justify-content: space-between; }
            .signature-box { width: 45%; border-top: 1px solid #000; padding-top: 3mm; }
            .footer { margin-top: 5mm; text-align: center; font-size: 10px; }
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
              <div style="text-align: center;  font-size: 12px; margin-top: 8px; padding: 4px 8px; border-radius: 4px;">
                ${invoiceType || 'فاتورة مبيعات'}
              </div>
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
              ${(invoice.items || []).map((it: InvoiceItem & { warehouseId?: string }, idx: number) => {
                const subtotal = Number(it.price) * Number(it.quantity);
                const discountValue = Number(it.discountValue) || 0;
                const taxValue = Number(it.taxValue) || 0;
                const afterDiscount = subtotal - discountValue;
                const net = afterDiscount + taxValue;
                const warehouseId = it.warehouseId || invoice.warehouse;
                const warehouseObj = Array.isArray(warehouses) ? warehouses.find(w => w.id === warehouseId) : null;
                const warehouseName = warehouseObj ? (warehouseObj.name || warehouseObj.id) : (warehouseId || '');
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
                    invoice.items.forEach((it: InvoiceItem) => { total += Number(it.discountValue) || 0; });
                    return total.toFixed(2);
                  })()}
                </td>
                <td style="color:#ea580c; font-weight:bold;">
                  ${(() => {
                    // إجمالي قبل الضريبة
                    if (!invoice.items) return '0.00';
                    let total = 0;
                    invoice.items.forEach((it: InvoiceItem) => {
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
                    invoice.items.forEach((it: InvoiceItem) => { total += Number(it.taxValue) || 0; });
                    return total.toFixed(2);
                  })()}
                </td>
                <td style="color:#059669; font-weight:bold;">
                  ${(() => {
                    // إجمالي النهائي
                    if (!invoice.items) return '0.00';
                    let total = 0;
                    invoice.items.forEach((it: InvoiceItem) => {
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
              <!-- Payment Method Table -->
              <table style="border:1.5px solid #000; border-radius:6px; font-size:13px; min-width:220px; max-width:320px; margin-left:0; margin-right:0; margin-top:10px; border-collapse:collapse; box-shadow:none; width:100%;">
                <thead>
                  <tr>
                    <td colspan="2" style="font-weight:bold; color:#fff; text-align:center; padding:7px 12px; border:1px solid #000; background:#305496;">تفاصيل طريقة الدفع</td>
                  </tr>
                </thead>
                <tbody>
                  ${(() => {
                    if (invoice.paymentMethod === 'متعدد' && invoice.multiplePayment) {
                      let paymentRows = '';
                      const multiplePayment = invoice.multiplePayment;
                      
                      // النقدي
                      if (multiplePayment.cash && parseFloat(multiplePayment.cash.amount || '0') > 0) {
                        const cashBoxId = multiplePayment.cash.cashBoxId || '';
                        // البحث عن اسم الصندوق من قائمة الصناديق
                        const cashBoxObj = Array.isArray(cashBoxes) ? cashBoxes.find(cb => cb.id === cashBoxId) : null;
                        const cashBoxName = cashBoxObj ? cashBoxObj.nameAr : cashBoxId;
                        paymentRows += `
                          <tr>
                            <td style="font-weight:bold; color:#000; text-align:right; padding:7px 12px; border:1px solid #000; background:#fff;">نقدي${cashBoxName ? ' - ' + cashBoxName : ''}</td>
                            <td style="text-align:left; font-weight:500; border:1px solid #000; background:#fff;">${parseFloat(multiplePayment.cash.amount || '0').toFixed(2)}</td>
                          </tr>`;
                      }
                      
                      // البنك
                      if (multiplePayment.bank && parseFloat(multiplePayment.bank.amount || '0') > 0) {
                        const bankId = multiplePayment.bank.bankId || '';
                        // البحث عن اسم البنك من قائمة البنوك
                        const bankObj = Array.isArray(banks) ? banks.find(b => b.id === bankId) : null;
                        const bankName = bankObj ? bankObj.arabicName : bankId;
                        paymentRows += `
                          <tr>
                            <td style="font-weight:bold; color:#000; text-align:right; padding:7px 12px; border:1px solid #000; background:#fff;">تحويل بنكي${bankName ? ' - ' + bankName : ''}</td>
                            <td style="text-align:left; font-weight:500; border:1px solid #000; background:#fff;">${parseFloat(multiplePayment.bank.amount || '0').toFixed(2)}</td>
                          </tr>`;
                      }
                      
                      // الشبكة
                      if (multiplePayment.card && parseFloat(multiplePayment.card.amount || '0') > 0) {
                        const cardBankId = multiplePayment.card.bankId || '';
                        // البحث عن اسم البنك من قائمة البنوك
                        const cardBankObj = Array.isArray(banks) ? banks.find(b => b.id === cardBankId) : null;
                        const cardBankName = cardBankObj ? cardBankObj.arabicName : cardBankId;
                        paymentRows += `
                          <tr>
                            <td style="font-weight:bold; color:#000; text-align:right; padding:7px 12px; border:1px solid #000; background:#fff;">شبكة${cardBankName ? ' - ' + cardBankName : ''}</td>
                            <td style="text-align:left; font-weight:500; border:1px solid #000; background:#fff;">${parseFloat(multiplePayment.card.amount || '0').toFixed(2)}</td>
                          </tr>`;
                      }
                      
                      return paymentRows || `
                        <tr>
                          <td style="font-weight:bold; color:#000; text-align:right; padding:7px 12px; border:1px solid #000; background:#fff;">لا توجد بيانات</td>
                          <td style="text-align:left; font-weight:500; border:1px solid #000; background:#fff;">0.00</td>
                        </tr>`;
                    } else {
                      // طريقة دفع واحدة
                      let paymentLabel = invoice.paymentMethod || 'غير محدد';
                      
                      // إضافة اسم الصندوق النقدي إذا كانت طريقة الدفع نقدي
                      if (invoice.paymentMethod === 'نقدي' && invoice.cashBox) {
                        // البحث عن اسم الصندوق من قائمة الصناديق
                        const cashBoxObj = Array.isArray(cashBoxes) ? cashBoxes.find(cb => cb.id === invoice.cashBox || cb.nameAr === invoice.cashBox) : null;
                        const cashBoxName = cashBoxObj ? cashBoxObj.nameAr : invoice.cashBox;
                        paymentLabel = `نقدي - ${cashBoxName}`;
                      }
                      
                      return `
                        <tr>
                          <td style="font-weight:bold; color:#000; text-align:right; padding:7px 12px; border:1px solid #000; background:#fff;">${paymentLabel}</td>
                          <td style="text-align:left; font-weight:500; border:1px solid #000; background:#fff;">${invoice.totals?.afterTax?.toFixed(2) || '0.00'}</td>
                        </tr>`;
                    }
                  })()}
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
              <div>البائع: ${getDelegateName(invoice.delegate || '')}</div>
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
      `;

      // إضافة العنصر إلى الصفحة
      document.body.appendChild(printContainer);

      // إنشاء stylesheet مخصص للطباعة
      const printStyleElement = document.createElement('style');
      printStyleElement.innerHTML = `
        @media print {
          body * { visibility: hidden; }
          #print-container, #print-container * { visibility: visible; }
          #print-container {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            height: auto !important;
          }
        }
      `;
      document.head.appendChild(printStyleElement);

      // تأخير قليل للتأكد من تحميل المحتوى
      setTimeout(() => {
        try {
          // بدء عملية الطباعة
          window.print();
        } catch (error) {
          message.error('حدث خطأ أثناء الطباعة');
          console.error('Print error:', error);
        } finally {
          // تنظيف العناصر المؤقتة
          setTimeout(() => {
            if (printContainer.parentNode) {
              printContainer.parentNode.removeChild(printContainer);
            }
            if (printStyleElement.parentNode) {
              printStyleElement.parentNode.removeChild(printStyleElement);
            }
          }, 1000);
        }
      }, 100);
    })();
};

  // ref for item name select
  const itemNameSelectRef = React.useRef<React.ComponentRef<typeof Select>>(null);

  // الحالة الأولية لنموذج إضافة صنف جديد
  const [addItemForm, setAddItemForm] = useState({
    name: '',
    itemCode: '',
    purchasePrice: '',
    salePrice: '',
    minOrder: '',
    discount: '',
    allowNegative: false,
    isVatIncluded: false,
    tempCodes: false,
    supplier: '',
    unit: '',
    type: '', // مهم لظهور اختيار المستوى الأول
    parentId: '' // مهم لربط المستوى الأول
  });

  const handleAddItem = async () => {
    // لا تضف إذا لم يتم اختيار اسم صنف
    if (!item.itemName) {
      if (typeof message !== 'undefined' && message.info) {
        message.info('يرجى اختيار اسم الصنف أولاً');
      } else {
        alert('يرجى اختيار اسم الصنف أولاً');
      }
      return;
    }
    await addItem();
    // إعادة تعيين الصنف مع الضريبة الثابتة من الإعدادات
    setItem({
      ...initialItem,
      taxPercent: taxRate,
      quantity: '1'
    });
    // إعادة تعيين حالة التعديل
    setEditingItemIndex(null);
    setTimeout(() => {
      itemNameSelectRef.current?.focus?.();
    }, 100); // تأخير بسيط لضمان إعادة التهيئة
  };

  return (
    <div className="p-2 sm:p-6 w-full max-w-none">
      {/* إضافة الأنماط للرسائل الاحترافية */}
      <style>{`
        @keyframes slideInRight {
          0% {
            transform: translateX(100%);
            opacity: 0;
          }
          100% {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        @keyframes progressBar {
          0% {
            width: 100%;
          }
          100% {
            width: 0%;
          }
        }
        
        .notification-container {
          animation: slideInRight 0.3s ease-out;
        }
        
        .notification-container:hover .progress-bar {
          animation-play-state: paused;
        }
      `}</style>

      {/* منطقة عرض الرسائل الاحترافية */}
      {notifications.length > 0 && (
        <div style={{ 
          position: 'fixed',
          top: 20,
          right: 20,
          zIndex: 9999,
          maxWidth: 400,
          direction: 'rtl'
        }}>
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className="notification-container"
              style={{
                marginBottom: 12,
                padding: '16px 20px',
                borderRadius: 12,
                background: notification.type === 'success' ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' :
                          notification.type === 'error' ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' :
                          notification.type === 'warning' ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' :
                          'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                color: 'white',
                boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                border: '1px solid rgba(255,255,255,0.2)',
                backdropFilter: 'blur(10px)',
                position: 'relative',
                overflow: 'hidden',
                cursor: 'pointer'
              }}
            >
              {/* خط التقدم */}
              <div
                className="progress-bar"
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  height: 3,
                  background: 'rgba(255,255,255,0.5)',
                  animation: 'progressBar 5s linear forwards',
                  borderRadius: '0 0 12px 12px'
                }}
              />
              
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                {/* أيقونة */}
                <div style={{
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  borderRadius: '50%',
                  padding: 8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: 32,
                  height: 32
                }}>
                  {notification.type === 'success' && (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                  )}
                  {notification.type === 'error' && (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                      <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"/>
                    </svg>
                  )}
                  {notification.type === 'warning' && (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                      <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
                    </svg>
                  )}
                  {notification.type === 'info' && (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
                    </svg>
                  )}
                </div>
                
                {/* المحتوى */}
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontWeight: 700,
                    fontSize: 14,
                    marginBottom: 4,
                    fontFamily: 'Cairo, sans-serif'
                  }}>
                    {notification.title}
                  </div>
                  <div style={{
                    fontSize: 13,
                    lineHeight: 1.4,
                    fontFamily: 'Cairo, sans-serif',
                    opacity: 0.95
                  }}>
                    {notification.message}
                  </div>
                  <div style={{
                    fontSize: 11,
                    marginTop: 6,
                    opacity: 0.8,
                    fontFamily: 'Cairo, sans-serif'
                  }}>
                    {notification.timestamp.toLocaleTimeString('ar-SA', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                </div>

                {/* زر الإغلاق */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setNotifications(prev => prev.filter(n => n.id !== notification.id));
                  }}
                  style={{
                    background: 'rgba(255,255,255,0.2)',
                    border: 'none',
                    borderRadius: '50%',
                    width: 24,
                    height: 24,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: 'white',
                    fontSize: 14,
                    fontWeight: 'bold',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
                  }}
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="p-4 font-['Tajawal'] bg-white mb-4 rounded-lg shadow-[0_0_10px_rgba(0,0,0,0.1)] relative overflow-hidden">
        <div className="flex items-center">
          <EditOutlined className="h-8 w-8 text-blue-600 ml-3" />
          <h1 className="text-2xl font-bold text-gray-800">تعديل فاتورة مبيعات</h1>
        </div>
        <p className="text-gray-600 mt-2">تعديل وتحديث بيانات فاتورة المبيعات</p>
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-purple-500"></div>
      </div>

      <Breadcrumb
        items={[
          { label: "الرئيسية", to: "/" },
          { label: "إدارة المبيعات", to: "/management/sales" },
          { label: "قائمة الفواتير", to: "/stores/edit-sales-invoice" },
          { label: "تعديل فاتورة" }
        ]}
      />

      {/* التحقق من حالة التحميل */}
      {loadingInvoice && (
        <div className="flex justify-center items-center h-64">
          <Spin size="large" />
          <span className="ml-3">جاري تحميل بيانات الفاتورة...</span>
        </div>
      )}

      {/* التحقق من عدم وجود الفاتورة */}
      {invoiceNotFound && !loadingInvoice && (
        <div className="text-center p-8">
          <div className="text-red-500 text-6xl mb-4">❌</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">لم يتم العثور على الفاتورة</h2>
          <p className="text-gray-600 mb-4">الفاتورة المطلوبة غير موجودة أو تم حذفها</p>
          <Button
            type="primary"
            onClick={() => navigate('/stores/edit-sales-invoice')}
          >
            العودة إلى قائمة الفواتير
          </Button>
        </div>
      )}

      {/* النموذج - يظهر فقط إذا تم تحميل الفاتورة بنجاح */}
      {!loadingInvoice && !invoiceNotFound && (
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
                disabled={!!invoiceData.branch}
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
                disabled={!!invoiceData.branch}
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
                        customMessage.success('تم تطبيق آخر سعر للعميل بنجاح');
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
          {/* معلومات الفاتورة الأساسية */}
          <Divider orientation="left" style={{ fontFamily: 'Cairo, sans-serif', marginBottom: 16 }}>
            المعلومات الأساسية
          </Divider>
          
          {/* رسالة معلوماتية عن السنة المالية */}
          {currentFinancialYear && (
            <div style={{ marginBottom: 16 }}>
              <Card 
                size="small" 
                style={{ 
                  // background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
                  // border: '1px solid #2196f3',
                  // borderRadius: 8
                }}
              >
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 12,
                  padding: '4px 0'
                }}>
                  <div style={{
                    backgroundColor: '#2196f3',
                    borderRadius: '50%',
                    padding: 6,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                      <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
                    </svg>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ 
                      fontWeight: 600, 
                      color: '#1565c0',
                      fontSize: '13px',
                      fontFamily: 'Cairo, sans-serif'
                    }}>
                      السنة المالية النشطة: {currentFinancialYear.year}
                    </div>
                    <div style={{ 
                      fontSize: '12px', 
                      color: '#1976d2',
                      fontFamily: 'Cairo, sans-serif',
                      lineHeight: 1.3,
                      marginTop: 2
                    }}>
                      يمكن إدخال التواريخ فقط من {currentFinancialYear.startDate} إلى {currentFinancialYear.endDate}
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}
          
          <Row gutter={16} className="mb-4">
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
                  onChange={(date, dateString) => {
                    const newDate = Array.isArray(dateString) ? dateString[0] : dateString as string;
                    
                    // التحقق من صحة التاريخ
                    if (newDate && !handleDateValidation(newDate, 'تاريخ الفاتورة')) {
                      return; // لا تحديث التاريخ إذا كان خارج النطاق
                    }
                    
                    setInvoiceData({
                      ...invoiceData, 
                      date: newDate,
                      dueDate: calculateDueDate(newDate) // حساب تاريخ الاستحقاق تلقائياً
                    });
                  }}
                  format="YYYY-MM-DD"
                  placeholder="التاريخ"
                  disabledDate={disabledDate}
                  status={invoiceData.date && !validateDate(invoiceData.date) ? 'error' : undefined}
                />
                {invoiceData.date && !validateDate(invoiceData.date) && (
                  <div style={{ color: '#ff4d4f', fontSize: '12px', marginTop: '4px' }}>
                    {getDateValidationMessage(invoiceData.date)}
                  </div>
                )}
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={6}>
              <Form.Item label="تاريخ الاستحقاق">
                <DatePicker
                  style={{ width: '100%' }}
                  value={invoiceData.dueDate ? dayjs(invoiceData.dueDate) : null}
                  onChange={(date, dateString) => {
                    const newDueDate = Array.isArray(dateString) ? dateString[0] : dateString as string;
                    
                    // التحقق من صحة التاريخ
                    if (newDueDate && !handleDateValidation(newDueDate, 'تاريخ الاستحقاق')) {
                      return; // لا تحديث التاريخ إذا كان خارج النطاق
                    }
                    
                    setInvoiceData({
                      ...invoiceData, 
                      dueDate: newDueDate
                    });
                  }}
                  format="YYYY-MM-DD"
                  placeholder="تاريخ الاستحقاق"
                  disabledDate={disabledDate}
                  status={invoiceData.dueDate && !validateDate(invoiceData.dueDate) ? 'error' : undefined}
                />
                {invoiceData.dueDate && !validateDate(invoiceData.dueDate) && (
                  <div style={{ color: '#ff4d4f', fontSize: '12px', marginTop: '4px' }}>
                    {getDateValidationMessage(invoiceData.dueDate)}
                  </div>
                )}
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16} className="mb-4">
            <Col xs={24} sm={12} md={6}>
              <Form.Item label="البائع">
                <Select
                  showSearch
                  value={invoiceData.delegate}
                  onChange={value => {
                    console.log('تم اختيار مندوب جديد:', value);
                    setInvoiceData({ ...invoiceData, delegate: value });
                  }}
                  placeholder="اختر البائع"
                  style={{ fontFamily: 'Cairo, sans-serif' }}
                  filterOption={(input, option) =>
                    String(option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  options={(() => {
                    const options = delegates?.map(d => ({ 
                      label: d.name || d.email || d.id, 
                      value: d.id 
                    })) || [];
                    console.log('خيارات dropdown البائع:', options);
                    return options;
                  })()}
                  allowClear
                />
              </Form.Item>
            </Col>
          </Row>

          {/* معلومات الفرع والمخزن */}
          <Divider orientation="left" style={{ fontFamily: 'Cairo, sans-serif', marginBottom: 16 }}>
            معلومات الفرع والمخزن
          </Divider>
          <Row gutter={16} className="mb-4">
            <Col xs={24} sm={12} md={12}>
              <Form.Item label="الفرع">
                <Select
                  showSearch
                  value={invoiceData.branch}
                  onChange={async (value) => {
                    setBranchCode('');
                    const invoiceNumber = await generateInvoiceNumberAsync(value, branches);
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
            {warehouseMode !== 'multiple' && (
              <Col xs={24} sm={12} md={12}>
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
            )}
          </Row>

          {/* معلومات العميل */}
          <Divider orientation="left" style={{ fontFamily: 'Cairo, sans-serif', marginBottom: 16 }}>
            معلومات العميل
          </Divider>
          <Row gutter={16} className="mb-4">
            <Col xs={24} sm={18} md={18}>
              <Form.Item label="اسم العميل">
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <Button
                    type="default"
                    style={{ padding: '0 8px', fontWeight: 700, background: 'transparent', boxShadow: 'none', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb' }}
                    onClick={() => setShowAddCustomerModal(true)}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
                  <Button
                    type="default"
                    icon={<SearchOutlined />}
                    style={{ minWidth: 40 }}
                    onClick={() => setShowCustomerSearch(true)}
                  />
                </div>
              </Form.Item>
            </Col>
            <Col xs={24} sm={6} md={6}>
              <Form.Item label="رقم العميل">
                <Input
                  id="customerNumber"
                  value={invoiceData.customerNumber}
                  placeholder="رقم العميل"
                  disabled
                />
              </Form.Item>
            </Col>
          </Row>



          {/* معلومات الضريبة (للفاتورة الضريبية فقط) */}
          {invoiceType === 'ضريبة' && (
            <>
              <Divider orientation="left" style={{ fontFamily: 'Cairo, sans-serif', marginBottom: 16 }}>
                المعلومات الضريبية
              </Divider>
              <Row gutter={16} className="mb-4">
                <Col xs={24} sm={12} md={12}>
                  <Form.Item label="السجل التجاري">
                    <Input
                      id="commercialRecord"
                      value={invoiceData.commercialRecord}
                      placeholder="السجل التجاري"
                      disabled
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={12}>
                  <Form.Item label="الملف الضريبي">
                    <Input
                      id="taxFile"
                      value={invoiceData.taxFile}
                      placeholder="الملف الضريبي"
                      disabled
                    />
                  </Form.Item>
                </Col>
              </Row>
            </>
          )}

          {/* منطقة عرض الرسائل والتنبيهات */}
          <div style={{ marginBottom: 24 }}>
            <Card 
              size="small" 
              style={{ 
                background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                border: '1px solid #dee2e6',
                borderRadius: 8
              }}
            >
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 12,
                padding: '8px 0'
              }}>
                <div style={{
                  backgroundColor: '#0ea5e9',
                  borderRadius: '50%',
                  padding: 8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ 
                    fontWeight: 600, 
                    color: '#495057',
                    marginBottom: 4,
                    fontFamily: 'Cairo, sans-serif'
                  }}>
                    حالة الفاتورة الحالية
                  </div>
                  <div style={{ 
                    fontSize: 13, 
                    color: '#6c757d',
                    fontFamily: 'Cairo, sans-serif',
                    lineHeight: 1.4
                  }}>
                    {!invoiceData.branch && (
                      <span style={{ color: '#dc3545', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2L1 21h22L12 2zm0 3.5L19.53 19H4.47L12 5.5zM11 10v4h2v-4h-2zm0 6v2h2v-2h-2z"/>
                        </svg>
                        يرجى اختيار الفرع أولاً
                      </span>
                    )}
                    {invoiceData.branch && !invoiceData.customerName && (
                      <span style={{ color: '#fd7e14', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2L1 21h22L12 2zm0 3.5L19.53 19H4.47L12 5.5zM11 10v4h2v-4h-2zm0 6v2h2v-2h-2z"/>
                        </svg>
                        يرجى اختيار العميل
                      </span>
                    )}
                    {warehouseMode !== 'multiple' && invoiceData.branch && !invoiceData.warehouse && (
                      <span style={{ color: '#fd7e14', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2L1 21h22L12 2zm0 3.5L19.53 19H4.47L12 5.5zM11 10v4h2v-4h-2zm0 6v2h2v-2h-2z"/>
                        </svg>
                        يرجى اختيار المخزن
                      </span>
                    )}
                    {invoiceData.branch && invoiceData.customerName && 
                     (warehouseMode === 'multiple' || invoiceData.warehouse) && (
                      <span style={{ color: '#198754', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                        </svg>
                        يمكنك الآن إضافة الأصناف
                      </span>
                    )}
                    {items.length > 0 && (
                      <span style={{ color: '#0d6efd', fontWeight: 500, marginLeft: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 10.95 5.16-1.21 9-5.4 9-10.95V7L12 2z"/>
                          <path d="M10 14l-3-3 1.41-1.41L10 11.17l5.59-5.58L17 7l-7 7z" fill="white"/>
                        </svg>
                        تم إضافة {items.length} صنف | الإجمالي: {totals.afterTax.toFixed(2)} ر.س - يرجى اختيار طريقة الدفع
                      </span>
                    )}
                    {items.length > 0 && invoiceData.paymentMethod && (
                      <span style={{ color: '#198754', fontWeight: 500, marginLeft: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                        </svg>
                        تم اختيار طريقة الدفع - الفاتورة جاهزة للحفظ
                      </span>
                    )}
                    {multiplePaymentMode && items.length > 0 && (
                      <span style={{ 
                        color: Math.abs(
                          (parseFloat(invoiceData.multiplePayment.cash?.amount || '0') +
                           parseFloat(invoiceData.multiplePayment.bank?.amount || '0') +
                           parseFloat(invoiceData.multiplePayment.card?.amount || '0')) - totals.afterTax
                        ) > 0.01 ? '#dc2626' : '#059669', 
                        fontWeight: 500, 
                        marginLeft: 16, 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 6 
                      }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          {Math.abs(
                            (parseFloat(invoiceData.multiplePayment.cash?.amount || '0') +
                             parseFloat(invoiceData.multiplePayment.bank?.amount || '0') +
                             parseFloat(invoiceData.multiplePayment.card?.amount || '0')) - totals.afterTax
                          ) > 0.01 ? (
                            <path d="M12 2L1 21h22L12 2zm0 3.5L19.53 19H4.47L12 5.5zM11 10v4h2v-4h-2zm0 6v2h2v-2h-2z"/>
                          ) : (
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                          )}
                        </svg>
                        المتبقي: {(totals.afterTax - (
                          parseFloat(invoiceData.multiplePayment.cash?.amount || '0') +
                          parseFloat(invoiceData.multiplePayment.bank?.amount || '0') +
                          parseFloat(invoiceData.multiplePayment.card?.amount || '0')
                        )).toFixed(2)} ر.س
                        {Math.abs(
                          (parseFloat(invoiceData.multiplePayment.cash?.amount || '0') +
                           parseFloat(invoiceData.multiplePayment.bank?.amount || '0') +
                           parseFloat(invoiceData.multiplePayment.card?.amount || '0')) - totals.afterTax
                        ) > 0.01 && ' - يجب أن يكون 0.00 للحفظ'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <Divider orientation="left" style={{ fontFamily: 'Cairo, sans-serif' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>إضافة أصناف المبيعات</span>
              {editingItemIndex !== null && (
                <span style={{
                  background: 'linear-gradient(135deg, #ffc107 0%, #ffca2c 100%)',
                  color: '#000',
                  padding: '4px 8px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  boxShadow: '0 2px 4px rgba(255, 193, 7, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                  جاري تعديل الصنف رقم {editingItemIndex + 1}
                </span>
              )}
            </div>
          </Divider>




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
            <Col xs={24} sm={12} md={6}>

              <div style={{ width: '100%' }}>
                <div style={{ marginBottom: 0, fontWeight: 500 }}>اسم الصنف</div>
                <Space.Compact style={{ display: 'flex', width: '100%' }}>
                  <Select
                    ref={itemNameSelectRef}
                    showSearch
                    value={item.itemName}
                    placeholder="اسم الصنف"
                    style={{ flex: 1, fontFamily: 'Cairo, sans-serif' }}
                    optionLabelProp="label"
                    onChange={async (value) => {
                      const selected = itemNames.find(i => i.name === value);
                      
                      // فحص إذا كان الصنف موقوف مؤقتاً
                      if (selected && selected.tempCodes) {
                        customMessage.warning(`تم إيقاف الصنف "${value}" مؤقتاً ولا يمكن إضافته للفاتورة`);
                        // إعادة تعيين اختيار الصنف
                        setItem({
                          ...item,
                          itemName: '',
                          itemNumber: '',
                          price: '',
                          discountPercent: '0',
                          quantity: '1'
                        });
                        return;
                      }
                      
                      let price = selected && selected.salePrice ? String(selected.salePrice) : '';
                      if (priceType === 'آخر سعر العميل' && invoiceData.customerName) {
                        const lastPrice = await fetchLastCustomerPrice(invoiceData.customerName, value);
                        if (lastPrice) price = String(lastPrice);
                      }
                      
                      setItem({
                        ...item,
                        itemName: value,
                        itemNumber: selected ? (selected.itemCode || '') : '',
                        price,
                        discountPercent: selected && selected.discount ? String(selected.discount) : '0',
                        taxPercent: taxRate, // استخدام نسبة الضريبة من إعدادات الشركة دائماً
                        quantity: '1'
                      });
                      
                      // جلب رصيد الصنف في حالة المخازن المتعددة والمخزن محدد
                      if (warehouseMode === 'multiple' && item.warehouseId && value) {
                        await fetchSingleItemStock(value, item.warehouseId);
                      }
                      
                      // إظهار رسالة معلوماتية عن الرصيد المتاح
                      const currentWarehouse = warehouseMode === 'single' ? invoiceData.warehouse : item.warehouseId;
                      if (currentWarehouse) {
                        let currentStock;
                        if (warehouseMode === 'single') {
                          currentStock = itemStocks[value];
                        } else {
                          // جلب الرصيد فورياً في حالة المخازن المتعددة
                          currentStock = await checkStockAvailability(value, currentWarehouse);
                          // تحديث الحالة
                          setItemStocks(prev => ({
                            ...prev,
                            [`${value}-${currentWarehouse}`]: currentStock
                          }));
                        }
                        
                        if (currentStock !== undefined) {
                          if (currentStock > 0) {
                            message.info(`الرصيد المتاح: ${currentStock}`, 2);
                          } else if (currentStock === 0) {
                            message.warning(`تحذير: الصنف غير متوفر في المخزون`, 3);
                          } else {
                            message.warning(`تحذير: الرصيد سالب: ${Math.abs(currentStock)}`, 3);
                          }
                        }
                      }
                    }}
                    filterOption={(input, option) => {
                      const itemName = String(option?.value ?? '').toLowerCase();
                      const selectedItem = itemNames.find(i => i.name === option?.value);
                      const itemCode = String(selectedItem?.itemCode ?? '').toLowerCase();
                      const searchTerm = input.toLowerCase();
                      return itemName.includes(searchTerm) || itemCode.includes(searchTerm);
                    }}
                    allowClear
                  >
                    {itemNames.map((i, index) => {
                      const currentWarehouse = warehouseMode === 'single' ? invoiceData.warehouse : item.warehouseId;
                      const stockKey = warehouseMode === 'single' ? i.name : `${i.name}-${currentWarehouse}`;
                      const stock = currentWarehouse ? itemStocks[stockKey] : undefined;
                      
                      return (
                        <Select.Option 
                          key={i.id || `${i.name}-${index}`} 
                          value={i.name}
                          label={i.name}
                          disabled={!!i.tempCodes}
                          style={{
                            color: i.tempCodes ? '#ff4d4f' : 'inherit',
                            backgroundColor: i.tempCodes ? '#fff2f0' : 'inherit'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
<span style={{ fontWeight: 600 }}>
  {i.name}
  {i.tempCodes ? (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ verticalAlign: 'middle', marginLeft: 2 }}>
        <circle cx="12" cy="12" r="10" stroke="#ff4d4f" strokeWidth="2" fill="#fff2f0" />
        <path d="M8 12h8" stroke="#ff4d4f" strokeWidth="2" strokeLinecap="round" />
      </svg>
      (إيقاف مؤقت)
    </span>
  ) : ''}
</span>
                              {i.itemCode && (
                                <span style={{ fontSize: '12px', color: '#666', fontFamily: 'monospace' }}>
                                  كود: {i.itemCode}
                                </span>
                              )}
                            </div>
                            {currentWarehouse && (
                              <span 
                                style={{ 
                                  color: stock !== undefined ? 
                                    (stock > 0 ? '#52c41a' : stock === 0 ? '#faad14' : '#ff4d4f') : 
                                    '#1890ff',
                                  fontSize: '12px',
                                  fontWeight: 'bold',
                                  marginRight: '8px'
                                }}
                              >
                                {stock !== undefined ? 
                                  (stock > 0 ? `متوفر: ${stock}` : stock === 0 ? 'غير متوفر' : `سالب: ${Math.abs(stock)}`) :
                                  (loadingStocks ? 'جاري التحميل...' : 'اختر المخزن')
                                }
                              </span>
                            )}
                          </div>
                        </Select.Option>
                      );
                    })}
                  </Select>
                  <Button
                    type="default"
                    size="middle"
                    style={{ 
                      borderLeft: 0,
                      borderTopLeftRadius: 0,
                      borderBottomLeftRadius: 0,
                      backgroundColor: '#ffffff',
                      borderColor: '#d1d5db',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minWidth: 40
                    }}
                    onClick={() => setShowAddItemModal(true)}
                    title="إضافة صنف جديد"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="3" y="3" width="18" height="18" rx="3" stroke="#2563eb" strokeWidth="2" fill="none"/>
                      <path d="M9 12h6m-3-3v6" stroke="#2563eb" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </Button>
                </Space.Compact>
                {/* مودال إضافة صنف جديد */}
<Modal
  open={showAddItemModal}
  onCancel={() => setShowAddItemModal(false)}
  footer={null}
  title={
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'Cairo', fontWeight: 700 }}>
      <span style={{ background: '#e0e7ef', borderRadius: '50%', padding: 8, boxShadow: '0 2px 8px #e0e7ef' }}>
        <svg width="24" height="24" fill="#305496" viewBox="0 0 24 24"><path d="M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20zm0 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16zm1 3v4h4v2h-4v4h-2v-4H7v-2h4V5h2z"/></svg>
      </span>
      إضافة صنف جديد
    </div>
  }
  width={750}
  styles={{ 
    body: { 
      background: 'linear-gradient(135deg, #f8fafc 80%, #e0e7ef 100%)', 
      borderRadius: 16, 
      padding: 28, 
      boxShadow: '0 8px 32px #b6c2d655' 
    } 
  }}
  style={{ top: 60 }}
  destroyOnClose
>
  <div style={{ marginBottom: 16 }}>
    <div style={{ 
      marginBottom: 12, 
      padding: 8, 
      background: '#e0e7ef', 
      borderRadius: 8, 
      textAlign: 'center', 
      fontWeight: 500, 
      color: '#305496', 
      fontFamily: 'Cairo', 
      fontSize: 15 
    }}>
      يرجى تعبئة بيانات الصنف بدقة
    </div>
  </div>
  <Form
    layout="vertical"
    onFinish={() => {
      if (addItemForm.tempCodes && message && message.warning) {
        message.warning('تم إيقاف هذا الصنف مؤقتًا.');
      }
      handleAddNewItem();
    }}
    style={{ fontFamily: 'Cairo' }}
    initialValues={addItemForm}
  >
  <Row gutter={16}>
    <Col span={8}>
      <Form.Item label="نوع الصنف" required>
        <Input value="مستوى ثاني" disabled style={{ color: '#888', background: '#f3f4f6', fontWeight: 500, fontSize: 15, borderRadius: 6 }} />
      </Form.Item>
    </Col>
    <Col span={8}>
      {allItems && allItems.filter(i => i.type === 'مستوى أول').length > 0 && (
        <Form.Item label="المستوى الأول" required>
          <Select
            value={addItemForm.parentId || ''}
            onChange={v => setAddItemForm(f => ({ ...f, parentId: v }))}
            placeholder="اختر المستوى الأول"
            style={{ fontWeight: 500, fontSize: 15, borderRadius: 6 }}
          >
            {allItems.filter(i => i.type === 'مستوى أول').map(i => (
              <Select.Option key={i.id || i.name} value={i.id}>{i.name}</Select.Option>
            ))}
          </Select>
        </Form.Item>
      )}
    </Col>
    <Col span={8}>
      <Form.Item label="اسم الصنف" required>
        <Input
          value={addItemForm.name || ''}
          onChange={e => setAddItemForm(f => ({ ...f, name: e.target.value }))}
          placeholder="اسم الصنف"
          autoFocus
          style={{ fontWeight: 500, fontSize: 15, borderRadius: 6 }}
        />
      </Form.Item>
    </Col>
  </Row>
  <Row gutter={16}>
    <Col span={8}>
      <Form.Item label="كود الصنف">
        <Input
          value={addItemForm.itemCode || ''}
          onChange={e => setAddItemForm(f => ({ ...f, itemCode: e.target.value }))}
          placeholder="كود الصنف"
          style={{ fontWeight: 500, fontSize: 15, borderRadius: 6 }}
        />
      </Form.Item>
    </Col>
    <Col span={8}>
      <Form.Item label="سعر الشراء">
        <Input
          value={addItemForm.purchasePrice || ''}
          onChange={e => setAddItemForm(f => ({ ...f, purchasePrice: e.target.value }))}
          placeholder="سعر الشراء"
          type="number"
          min={0}
          style={{ fontWeight: 500, fontSize: 15, borderRadius: 6 }}
        />
      </Form.Item>
    </Col>
    <Col span={8}>
      <Form.Item label="سعر البيع">
        <Input
          value={addItemForm.salePrice || ''}
          onChange={e => setAddItemForm(f => ({ ...f, salePrice: e.target.value }))}
          placeholder="سعر البيع"
          type="number"
          min={0}
          style={{ fontWeight: 500, fontSize: 15, borderRadius: 6 }}
        />
      </Form.Item>
    </Col>
  </Row>
  <Row gutter={16}>
    <Col span={8}>
      <Form.Item label="الحد الأدنى للطلب">
        <Input
          value={addItemForm.minOrder || ''}
          onChange={e => setAddItemForm(f => ({ ...f, minOrder: e.target.value }))}
          placeholder="الحد الأدنى للطلب"
          type="number"
          min={0}
          style={{ fontWeight: 500, fontSize: 15, borderRadius: 6 }}
        />
      </Form.Item>
    </Col>
    <Col span={8}>
      <Form.Item label="نسبة الخصم">
        <Input
          value={addItemForm.discount || ''}
          onChange={e => setAddItemForm(f => ({ ...f, discount: e.target.value }))}
          placeholder="نسبة الخصم"
          type="number"
          min={0}
          max={100}
          style={{ fontWeight: 500, fontSize: 15, borderRadius: 6 }}
        />
      </Form.Item>
    </Col>
    <Col span="8">
      {/* Empty for alignment or add more fields here if needed */}
    </Col>
  </Row>
    <Form.Item>
      <div style={{ display: 'flex', gap: 16 }}>
        <label style={{ fontWeight: 500, marginBottom: 0, cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={!!addItemForm.allowNegative}
            onChange={e => setAddItemForm(f => ({ ...f, allowNegative: e.target.checked }))}
            style={{ marginLeft: 6 }}
          />
          السماح بالسالب
        </label>
        <label style={{ fontWeight: 500, marginBottom: 0, cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={!!addItemForm.isVatIncluded}
            onChange={e => setAddItemForm(f => ({ ...f, isVatIncluded: e.target.checked }))}
            style={{ marginLeft: 6 }}
          />
          شامل الضريبة
        </label>
        <label style={{ fontWeight: 500, marginBottom: 0, cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={!!addItemForm.tempCodes}
            onChange={e => setAddItemForm(f => ({ ...f, tempCodes: e.target.checked }))}
            style={{ marginLeft: 6 }}
          />
          إيقاف مؤقت
        </label>
      </div>
    </Form.Item>

    <Form.Item label="المورد">
      <Select
        value={addItemForm.supplier || ''}
        onChange={v => setAddItemForm(f => ({ ...f, supplier: v }))}
        placeholder="اختر المورد"
        style={{ fontWeight: 500, fontSize: 15, borderRadius: 6 }}
      >
        {suppliers && suppliers.map(s => (
          <Select.Option key={s.id} value={s.name}>{s.name}</Select.Option>
        ))}
      </Select>
    </Form.Item>
    <Form.Item label="الوحدة" required>
      <Select
        value={addItemForm.unit || ''}
        onChange={v => setAddItemForm(f => ({ ...f, unit: v }))}
        placeholder="اختر الوحدة"
        style={{ fontWeight: 500, fontSize: 15, borderRadius: 6 }}
      >
        {units.map(unit => (
          <Select.Option key={unit} value={unit}>{unit}</Select.Option>
        ))}
      </Select>
    </Form.Item>
    <Form.Item>
      <Button
        type="primary"
        htmlType="submit"
        loading={addItemLoading}
        style={{ 
          width: '100%', 
          fontWeight: 700, 
          fontSize: 16, 
          borderRadius: 8, 
          height: 44, 
          boxShadow: '0 2px 8px #e0e7ef' 
        }}
      >
        إضافة
      </Button>
    </Form.Item>
  </Form>
</Modal>
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
                  onChange={async (value) => {
                    setItem({ ...item, warehouseId: value });
                    // في حالة المخازن المتعددة، جلب رصيد الصنف الحالي في المخزن الجديد
                    if (item.itemName && value) {
                      await fetchSingleItemStock(item.itemName, value);
                    }
                  }}
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
                placeholder={(() => {
                  if (!item.itemName) return "الكمية";
                  const currentWarehouse = warehouseMode === 'single' ? invoiceData.warehouse : item.warehouseId;
                  if (!currentWarehouse) return "اختر المخزن";
                  const stockKey = warehouseMode === 'single' ? item.itemName : `${item.itemName}-${currentWarehouse}`;
                  const stock = itemStocks[stockKey];
                  return stock !== undefined ? `متاح: ${stock}` : "جاري تحميل الرصيد...";
                })()}
                type="number"
                min={1}
                style={{  
                  paddingLeft: 6, 
                  paddingRight: 6, 
                  fontSize: 15,
                  borderColor: (() => {
                    if (!item.itemName) return undefined;
                    const currentWarehouse = warehouseMode === 'single' ? invoiceData.warehouse : item.warehouseId;
                    if (!currentWarehouse) return undefined;
                    const stockKey = warehouseMode === 'single' ? item.itemName : `${item.itemName}-${currentWarehouse}`;
                    const stock = itemStocks[stockKey];
                    if (stock !== undefined && stock <= 0) return '#ff4d4f';
                    return undefined;
                  })()
                }}
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
              value={taxRate} 
              placeholder="% الضريبة" 
              style={{ fontFamily: 'Cairo',  paddingLeft: 4, paddingRight: 4, fontSize: 15, backgroundColor: '#f5f5f5' }}
              type="number" 
              min={0}
              disabled
              readOnly
            />
          </Col>
          <Col xs={24} sm={12} md={1}>
            <div style={{ marginBottom: 4, fontWeight: 500, visibility: 'hidden' }}>
              {editingItemIndex !== null ? 'تحديث' : 'إضافة'}
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              <Button 
                type="primary"
                onClick={handleAddItem}
                disabled={
                  !invoiceData.branch ||
                  (warehouseMode !== 'multiple' && !invoiceData.warehouse) ||
                  !invoiceData.customerName
                }
                style={{
                  backgroundColor: editingItemIndex !== null ? '#52c41a' : '#1890ff',
                  borderColor: editingItemIndex !== null ? '#52c41a' : '#1890ff',
                  minWidth: editingItemIndex !== null ? 'auto' : '40px'
                }}
                title={editingItemIndex !== null ? 'تحديث الصنف المحدد' : 'إضافة صنف جديد'}
                icon={
                  editingItemIndex !== null ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v8m4-4H8" />
                    </svg>
                  )
                }
              >
                {editingItemIndex !== null ? 'تحديث' : ''}
              </Button>
              {editingItemIndex !== null && (
                <Button 
                  type="default"
                  onClick={() => {
                    setEditingItemIndex(null);
                    setItem({
                      ...initialItem,
                      taxPercent: taxRate,
                      quantity: '1'
                    });
                    customMessage.info('تم إلغاء التعديل');
                  }}
                  style={{
                    backgroundColor: '#ff4d4f',
                    borderColor: '#ff4d4f',
                    color: '#fff'
                  }}
                  title="إلغاء التعديل"
                  icon={
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  }
                />
              )}
            </div>
          </Col>
          </Row>

          {/* Items Table */}
          <div className="mb-4">
            <style>{`
              .custom-items-table .ant-table-thead > tr > th {
                background: #2463eb8c !important;
                color: #fff !important;
                font-weight: bold;
              }
              
              .editing-item-row {
                background: linear-gradient(135deg, #fef3cd 0%, #fff4cc 100%) !important;
                border: 2px solid #ffc107 !important;
                box-shadow: 0 2px 8px rgba(255, 193, 7, 0.3) !important;
              }
              
              .editing-item-row:hover {
                background: linear-gradient(135deg, #ffeaa7 0%, #fdcb6e 100%) !important;
              }
              
              .editing-item-row td {
                border-color: #ffc107 !important;
                position: relative;
              }
              
              .editing-item-row td:first-child::before {
                content: '';
                position: absolute;
                left: 0;
                top: 0;
                bottom: 0;
                width: 4px;
                background: #ffc107;
              }
            `}</style>
            <Table 
              className="custom-items-table"
              columns={itemColumns} 
              dataSource={items} 
              pagination={false} 
              rowKey={(record, index) => `${record.itemNumber}-${record.itemName}-${index}`}
              bordered
              scroll={{ x: true }}
              size="middle"
              rowClassName={(record, index) => 
                editingItemIndex === index ? 'editing-item-row' : ''
              }
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

          {/* معلومات الدفع */}
          <Divider orientation="left" style={{ fontFamily: 'Cairo, sans-serif', marginBottom: 16 }}>
            معلومات الدفع
          </Divider>
          <Row gutter={16} className="mb-4">
            <Col xs={24} sm={12} md={6}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ minWidth: 80, fontWeight: 500 }}>طريقة الدفع:</span>
                <Select
                  showSearch
                  value={invoiceData.paymentMethod}
                  onChange={(value) => {
                    const isMultiple = value === 'متعدد';
                    setMultiplePaymentMode(isMultiple);
                    setInvoiceData({
                      ...invoiceData, 
                      paymentMethod: value,
                      cashBox: value === 'نقدي' ? invoiceData.cashBox : '',
                      multiplePayment: isMultiple ? invoiceData.multiplePayment : {}
                    });
                  }}
                  disabled={paymentMethods.length === 0}
                  placeholder="اختر طريقة الدفع"
                  style={{ fontFamily: 'Cairo, sans-serif', flex: 1 }}
                  filterOption={(input, option) =>
                    String(option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  options={[
                    ...paymentMethods.map(method => ({
                      label: method.name || method.id,
                      value: method.name || method.id
                    })),
                  ]}
                />
              </div>
            </Col>
            {invoiceData.paymentMethod === 'نقدي' && (
              <Col xs={24} sm={12} md={6}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ minWidth: 100, fontWeight: 500 }}>الصندوق النقدي:</span>
                  <Select
                    showSearch
                    value={invoiceData.cashBox}
                    onChange={(value) => setInvoiceData({...invoiceData, cashBox: value})}
                    disabled={cashBoxes.length === 0}
                    placeholder="اختر الصندوق النقدي"
                    style={{ fontFamily: 'Cairo, sans-serif', flex: 1 }}
                    filterOption={(input, option) =>
                      String(option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                    }
                    options={cashBoxes
                      .filter(cashBox => !invoiceData.branch || cashBox.branch === invoiceData.branch)
                      .map(cashBox => ({
                        label: cashBox.nameAr,
                        value: cashBox.id || cashBox.nameAr
                      }))}
                  />
                </div>
              </Col>
            )}
            {multiplePaymentMode && (
              <>
                <Col xs={24} sm={12} md={5}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ minWidth: 100, fontWeight: 500 }}>الصندوق النقدي:</span>
                    <Select
                      showSearch
                      value={invoiceData.multiplePayment.cash?.cashBoxId || ''}
                      onChange={(value) => setInvoiceData({
                        ...invoiceData, 
                        multiplePayment: {
                          ...invoiceData.multiplePayment,
                          cash: {
                            ...invoiceData.multiplePayment.cash,
                            cashBoxId: value,
                            amount: invoiceData.multiplePayment.cash?.amount || ''
                          }
                        }
                      })}
                      disabled={cashBoxes.length === 0}
                      placeholder="اختر الصندوق النقدي"
                      style={{ fontFamily: 'Cairo, sans-serif', flex: 1 }}
                      filterOption={(input, option) =>
                        String(option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                      }
                      options={cashBoxes
                        .filter(cashBox => !invoiceData.branch || cashBox.branch === invoiceData.branch)
                        .map(cashBox => ({
                          label: cashBox.nameAr,
                          value: cashBox.id || cashBox.nameAr
                        }))}
                      allowClear
                    />
                  </div>
                </Col>
                <Col xs={24} sm={12} md={4}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ minWidth: 70, fontWeight: 500 }}>المبلغ نقدي:</span>
                    <Input
                      value={invoiceData.multiplePayment.cash?.amount || ''}
                      onChange={(e) => setInvoiceData({
                        ...invoiceData, 
                        multiplePayment: {
                          ...invoiceData.multiplePayment,
                          cash: {
                            ...invoiceData.multiplePayment.cash,
                            cashBoxId: invoiceData.multiplePayment.cash?.cashBoxId || '',
                            amount: e.target.value
                          }
                        }
                      })}
                      onFocus={(e) => {
                        // تعبئة تلقائية للمبلغ المتبقي إذا كان الحقل فارغ
                        if (!e.target.value) {
                          const currentTotal = parseFloat(invoiceData.multiplePayment.bank?.amount || '0') + 
                                              parseFloat(invoiceData.multiplePayment.card?.amount || '0');
                          const remaining = totals.afterTax - currentTotal;
                          if (remaining > 0) {
                            setInvoiceData({
                              ...invoiceData, 
                              multiplePayment: {
                                ...invoiceData.multiplePayment,
                                cash: {
                                  ...invoiceData.multiplePayment.cash,
                                  cashBoxId: invoiceData.multiplePayment.cash?.cashBoxId || '',
                                  amount: remaining.toFixed(2)
                                }
                              }
                            });
                          }
                        }
                      }}
                      placeholder="المبلغ"
                      type="number"
                      min={0}
                      step={0.01}
                      disabled={!invoiceData.multiplePayment.cash?.cashBoxId}
                      style={{ flex: 1 }}
                    />
                  </div>
                </Col>
                <Col xs={24} sm={12} md={5}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ minWidth: 50, fontWeight: 500 }}>البنك:</span>
                    <Select
                      showSearch
                      value={invoiceData.multiplePayment.bank?.bankId || ''}
                      onChange={(value) => setInvoiceData({
                        ...invoiceData, 
                        multiplePayment: {
                          ...invoiceData.multiplePayment,
                          bank: {
                            ...invoiceData.multiplePayment.bank,
                            bankId: value,
                            amount: invoiceData.multiplePayment.bank?.amount || ''
                          }
                        }
                      })}
                      disabled={banks.length === 0}
                      placeholder="اختر البنك"
                      style={{ fontFamily: 'Cairo, sans-serif', flex: 1 }}
                      filterOption={(input, option) =>
                        String(option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                      }
                      options={banks.map(bank => ({
                        label: bank.arabicName,
                        value: bank.id || bank.arabicName
                      }))}
                      allowClear
                    />
                  </div>
                </Col>
                <Col xs={24} sm={12} md={4}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ minWidth: 70, fontWeight: 500 }}>المبلغ بنكي:</span>
                    <Input
                      value={invoiceData.multiplePayment.bank?.amount || ''}
                      onChange={(e) => setInvoiceData({
                        ...invoiceData, 
                        multiplePayment: {
                          ...invoiceData.multiplePayment,
                          bank: {
                            ...invoiceData.multiplePayment.bank,
                            bankId: invoiceData.multiplePayment.bank?.bankId || '',
                            amount: e.target.value
                          }
                        }
                      })}
                      onFocus={(e) => {
                        // تعبئة تلقائية للمبلغ المتبقي إذا كان الحقل فارغ
                        if (!e.target.value) {
                          const currentTotal = parseFloat(invoiceData.multiplePayment.cash?.amount || '0') + 
                                              parseFloat(invoiceData.multiplePayment.card?.amount || '0');
                          const remaining = totals.afterTax - currentTotal;
                          if (remaining > 0) {
                            setInvoiceData({
                              ...invoiceData, 
                              multiplePayment: {
                                ...invoiceData.multiplePayment,
                                bank: {
                                  ...invoiceData.multiplePayment.bank,
                                  bankId: invoiceData.multiplePayment.bank?.bankId || '',
                                  amount: remaining.toFixed(2)
                                }
                              }
                            });
                          }
                        }
                      }}
                      placeholder="المبلغ"
                      type="number"
                      min={0}
                      step={0.01}
                      disabled={!invoiceData.multiplePayment.bank?.bankId}
                      style={{ flex: 1 }}
                    />
                  </div>
                </Col>
              </>
            )}
          </Row>

          {multiplePaymentMode && (
            <Row gutter={16} className="mb-4">
              <Col xs={24} sm={12} md={6}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ minWidth: 50, fontWeight: 500 }}>شبكة:</span>
                  <Select
                    showSearch
                    value={invoiceData.multiplePayment.card?.bankId || ''}
                    onChange={(value) => setInvoiceData({
                      ...invoiceData, 
                      multiplePayment: {
                        ...invoiceData.multiplePayment,
                        card: {
                          ...invoiceData.multiplePayment.card,
                          bankId: value,
                          amount: invoiceData.multiplePayment.card?.amount || ''
                        }
                      }
                    })}
                    disabled={banks.length === 0}
                    placeholder="اختر بنك"
                    style={{ fontFamily: 'Cairo, sans-serif', flex: 1 }}
                    filterOption={(input, option) =>
                      String(option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                    }
                    options={banks.map(bank => ({
                      label: bank.arabicName,
                      value: bank.id || bank.arabicName
                    }))}
                    allowClear
                  />
                </div>
              </Col>
              <Col xs={24} sm={12} md={4}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ minWidth: 70, fontWeight: 500 }}>المبلغ شبكة:</span>
                  <Input
                    value={invoiceData.multiplePayment.card?.amount || ''}
                    onChange={(e) => setInvoiceData({
                      ...invoiceData, 
                      multiplePayment: {
                        ...invoiceData.multiplePayment,
                        card: {
                          ...invoiceData.multiplePayment.card,
                          bankId: invoiceData.multiplePayment.card?.bankId || '',
                          amount: e.target.value
                        }
                      }
                    })}
                    onFocus={(e) => {
                      // تعبئة تلقائية للمبلغ المتبقي إذا كان الحقل فارغ
                      if (!e.target.value) {
                        const currentTotal = parseFloat(invoiceData.multiplePayment.cash?.amount || '0') + 
                                            parseFloat(invoiceData.multiplePayment.bank?.amount || '0');
                        const remaining = totals.afterTax - currentTotal;
                        if (remaining > 0) {
                          setInvoiceData({
                            ...invoiceData, 
                            multiplePayment: {
                              ...invoiceData.multiplePayment,
                              card: {
                                ...invoiceData.multiplePayment.card,
                                bankId: invoiceData.multiplePayment.card?.bankId || '',
                                amount: remaining.toFixed(2)
                              }
                            }
                          });
                        }
                      }
                    }}
                    placeholder="المبلغ"
                    type="number"
                    min={0}
                    step={0.01}
                    disabled={!invoiceData.multiplePayment.card?.bankId}
                    style={{ flex: 1 }}
                  />
                </div>
              </Col>
            </Row>
          )}

          {multiplePaymentMode && (
            <Row gutter={16} className="mb-4">
              <Col xs={24}>
                <Card size="small" style={{ backgroundColor: '#f8f9fa' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: 16 }}>
                      <span style={{ fontWeight: 600 }}>
                        نقدي: {invoiceData.multiplePayment.cash?.amount || '0'}
                      </span>
                      <span style={{ fontWeight: 600 }}>
                        بنكي: {invoiceData.multiplePayment.bank?.amount || '0'}
                      </span>
                      <span style={{ fontWeight: 600 }}>
                        شبكه: {invoiceData.multiplePayment.card?.amount || '0'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: 16 }}>
                      <span style={{ fontWeight: 600 }}>
                        المجموع: {(
                          parseFloat(invoiceData.multiplePayment.cash?.amount || '0') +
                          parseFloat(invoiceData.multiplePayment.bank?.amount || '0') +
                          parseFloat(invoiceData.multiplePayment.card?.amount || '0')
                        ).toFixed(2)}
                      </span>
                      <span style={{ 
                        fontWeight: 600,
                        color: Math.abs(
                          (parseFloat(invoiceData.multiplePayment.cash?.amount || '0') +
                           parseFloat(invoiceData.multiplePayment.bank?.amount || '0') +
                           parseFloat(invoiceData.multiplePayment.card?.amount || '0')) - totals.afterTax
                        ) > 0.01 ? '#dc2626' : '#059669'
                      }}>
                        المتبقي: {(totals.afterTax - (
                          parseFloat(invoiceData.multiplePayment.cash?.amount || '0') +
                          parseFloat(invoiceData.multiplePayment.bank?.amount || '0') +
                          parseFloat(invoiceData.multiplePayment.card?.amount || '0')
                        )).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </Card>
              </Col>
            </Row>
          )}

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
                  if (!invoiceData.paymentMethod) {
                    if (typeof message !== 'undefined' && message.error) {
                      message.error('يرجى اختيار طريقة الدفع أولاً');
                    } else {
                      alert('يرجى اختيار طريقة الدفع أولاً');
                    }
                    return;
                  }
                  if (invoiceData.paymentMethod === 'نقدي' && !invoiceData.cashBox) {
                    if (typeof message !== 'undefined' && message.error) {
                      message.error('يرجى اختيار الصندوق النقدي');
                    } else {
                      alert('يرجى اختيار الصندوق النقدي');
                    }
                    return;
                  }
                  if (multiplePaymentMode && (!invoiceData.multiplePayment.cash?.cashBoxId && !invoiceData.multiplePayment.bank?.bankId && !invoiceData.multiplePayment.card?.bankId)) {
                    if (typeof message !== 'undefined' && message.error) {
                      message.error('يرجى اختيار وسائل الدفع للدفع المتعدد');
                    } else {
                      alert('يرجى اختيار وسائل الدفع للدفع المتعدد');
                    }
                    return;
                  }
                  
                  // التحقق من أن المتبقي يساوي 0.00 في حالة الدفع المتعدد
                  if (multiplePaymentMode) {
                    const totalPayments = parseFloat(invoiceData.multiplePayment.cash?.amount || '0') +
                                         parseFloat(invoiceData.multiplePayment.bank?.amount || '0') +
                                         parseFloat(invoiceData.multiplePayment.card?.amount || '0');
                    const remaining = totals.afterTax - totalPayments;
                    
                    if (Math.abs(remaining) > 0.01) {
                      if (typeof message !== 'undefined' && message.error) {
                        message.error(`لا يمكن حفظ الفاتورة. المتبقي يجب أن يكون 0.00 (المتبقي الحالي: ${remaining.toFixed(2)})`);
                      } else {
                        alert(`لا يمكن حفظ الفاتورة. المتبقي يجب أن يكون 0.00 (المتبقي الحالي: ${remaining.toFixed(2)})`);
                      }
                      return;
                    }
                  }
                  
                  await handleSave();
                  // تحديث الأصناف بعد الحفظ مباشرة
                  if (typeof fetchLists === 'function') {
                    await fetchLists();
                  }
                  // بعد الحفظ: توليد رقم فاتورة جديد للفاتورة التالية
                  const newInvoiceNumber = await generateInvoiceNumberAsync(invoiceData.branch, branches);
                  setInvoiceData(prev => ({
                    ...prev,
                    invoiceNumber: newInvoiceNumber
                  }));
                }}
                style={{ width: 150 }}
                loading={loading}
                disabled={items.length === 0}
              >
                تحديث الفاتورة 
              </Button>
            </Col>
            <Col>
              <Button
                type="default"
                size="large"
                onClick={() => navigate('/stores/edit-sales-invoice')}
                style={{ width: 150 }}
              >
                العودة إلى القائمة
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

          {/* سجل الفواتير تمت إزالته بناءً على طلب المستخدم */}
        </Card>
      </Spin>
      )}

    </div>
  );
};

export default EditSalesInvoiceDetailPage;
