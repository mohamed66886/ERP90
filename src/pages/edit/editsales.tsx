// صفحة تعديل الفاتورة
import React, { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { SearchOutlined } from '@ant-design/icons';
import { useAuth } from '@/contexts/useAuth';
import { doc, getDoc, collection, getDocs, addDoc, updateDoc } from 'firebase/firestore';
import dayjs from 'dayjs';
import { Button, Input, Table, message, Form, Row, Col, Select, InputNumber } from 'antd';
const { Option } = Select;
import Divider from 'antd/es/divider';
import * as XLSX from 'xlsx';
import Breadcrumb from "../../components/Breadcrumb";
import Card from 'antd/es/card';
import { PlusOutlined, SaveOutlined, UserOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
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
  tempCodes?: boolean;
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
  isNewItem?: boolean;
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
  extraDiscount?: number;
  itemData?: any;
}

const initialItem: InvoiceItem = {
  itemNumber: '',
  itemName: '',
  quantity: '1',
  unit: 'قطعة',
  price: '',
  discountPercent: '0',
  discountValue: 0,
  taxPercent: '15',
  taxValue: 0,
  total: 0,
  isNewItem: false
}




// صفحة تعديل الفاتورة
const EditSalesPage: React.FC = () => {
  // اجلب رقم الفاتورة من URL
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const invoiceParam = searchParams.get('invoice');
  // حالة الفروع والمخازن والمندوبين
  const [branches, setBranches] = useState<{ id: string; name: string }[]>([]);
  const [warehouses, setWarehouses] = useState<{ id: string; name: string }[]>([]);
  // حالة طرق الدفع
  const [paymentMethods, setPaymentMethods] = useState<{ id: string; name: string }[]>([]);
  // حالة العملاء
  // حالة المندوبين
  const [delegates, setDelegates] = useState<{ id: string; name: string }[]>([]);
  const [customers, setCustomers] = useState<{
    id: string;
    nameAr: string;
    nameEn?: string;
    customerPhone?: string;
    mobile?: string;
    commercialRecord?: string;
    taxFile?: string;
  }[]>([]);

  // حالة الصنف الجديد
  const [item, setItem] = useState<InvoiceItem>({
    itemNumber: '',
    itemName: '',
    quantity: '',
    unit: 'قطعة',
    price: '',
    discountPercent: '0',
    discountValue: 0,
    taxPercent: '15',
    taxValue: 0,
    total: 0,
    isNewItem: false
  });

  // دالة اختيار اسم الصنف وتحديث كود الصنف تلقائيًا
  const handleSelectItemName = (value: string) => {
    // ابحث عن الصنف المختار من قائمة الأصناف
    const selected = itemsList.find(i => i.name === value);
    setItem(prev => ({
      ...prev,
      itemName: value,
      itemNumber: selected && selected.itemCode ? selected.itemCode : '',
      price: selected && selected.salePrice ? selected.salePrice.toString() : ''
    }));
  };
  // حالة قائمة الأصناف
  const [itemsList, setItemsList] = useState<{ id: string; name: string; itemCode?: string; salePrice?: number }[]>([]);

  // دالة تحديث حقول الصنف
  const handleItemChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setItem(prev => ({ ...prev, [name]: value }));
  };

  // دالة إضافة صنف إلى الجدول
  const addItem = () => {
    if (!item.itemName || !item.quantity || !item.price) {
      message.error('يرجى إدخال اسم الصنف والكمية والسعر');
      return;
    }
    const quantity = Math.max(0, Number(item.quantity) || 0);
    const price = Math.max(0, Number(item.price) || 0);
    const discountPercent = Math.min(100, Math.max(0, Number(item.discountPercent) || 0));
    const taxPercent = Math.max(0, Number(item.taxPercent) || 0);
    const subtotal = price * quantity;
    const discountValue = subtotal * (discountPercent / 100);
    const taxableAmount = subtotal - discountValue;
    const taxValue = taxableAmount * (taxPercent / 100);
    const total = subtotal;
    const newItem: InvoiceItem = {
      ...item,
      discountValue: parseFloat(discountValue.toFixed(2)),
      taxValue: parseFloat(taxValue.toFixed(2)),
      total: parseFloat(total.toFixed(2))
    };
    const updatedItems = [...items, newItem];
    setItems(updatedItems);
    setItem({
      itemNumber: '',
      itemName: '',
      quantity: '',
      unit: 'قطعة',
      price: '',
      discountPercent: '0',
      discountValue: 0,
      taxPercent: '15',
      taxValue: 0,
      total: 0,
      isNewItem: false
    });
    // تحديث الفاتورة في قاعدة البيانات مباشرة بعد الإضافة
    const updateAfterAdd = async () => {
      try {
        if (!invoiceData.invoiceNumber) return;
        const cleanedItems = updatedItems.map(item => ({
          itemNumber: item.itemNumber,
          itemName: item.itemName,
          quantity: Number(item.quantity) || 0,
          unit: item.unit,
          price: Number(item.price) || 0,
          discountPercent: Number(item.discountPercent) || 0,
          discountValue: Number(item.discountValue) || 0,
          taxPercent: Number(item.taxPercent) || 0,
          taxValue: Number(item.taxValue) || 0,
          total: Number(item.total) || 0
        }));
        const cleanedInvoiceData = Object.fromEntries(
          Object.entries(invoiceData).filter(([_, v]) => v !== '' && v !== undefined && v !== null)
        );
        // ابحث عن معرف المستند الحقيقي أولاً
        const { query, where, getDocs, setDoc, doc } = await import('firebase/firestore');
        const invoicesQuery = query(collection(db, 'sales_invoices'), where('invoiceNumber', '==', invoiceData.invoiceNumber));
        const invoicesSnap = await getDocs(invoicesQuery);
        if (!invoicesSnap.empty) {
          const realDocId = invoicesSnap.docs[0].id;
          const invoiceRef = doc(db, 'sales_invoices', realDocId);
          await setDoc(invoiceRef, {
            ...cleanedInvoiceData,
            items: cleanedItems,
            updatedAt: new Date().toISOString(),
          }, { merge: true });
          message.success('تم حفظ الصنف الجديد في قاعدة البيانات');
        } else {
          message.error('لم يتم العثور على الفاتورة لتعديلها');
        }
      } catch (err) {
        message.error('حدث خطأ أثناء حفظ الصنف الجديد: ' + (err?.message || err));
      }
    };
    updateAfterAdd();
  };
  // دالة تحديث الفاتورة في قاعدة البيانات
  const updateInvoice = async () => {
    try {
      // تحقق من وجود رقم الفاتورة
      if (!invoiceData.invoiceNumber) {
        message.error('رقم الفاتورة غير موجود');
        return;
      }
      // تحقق من عدم وجود رموز غير مسموحة في رقم الفاتورة
      if (/[\/\.#$\[\]]/.test(invoiceData.invoiceNumber)) {
        message.error('رقم الفاتورة يحتوي على رموز غير مسموحة في Firestore');
        return;
      }
      // طباعة البيانات في الكونسول قبل التحديث
      console.log('بيانات الفاتورة قبل التحديث:', invoiceData);
      // تصفية وتحويل بيانات الأصناف
      const cleanedItems = items.map(item => ({
        itemNumber: item.itemNumber,
        itemName: item.itemName,
        quantity: Number(item.quantity) || 0,
        unit: item.unit,
        price: Number(item.price) || 0,
        discountPercent: Number(item.discountPercent) || 0,
        discountValue: Number(item.discountValue) || 0,
        taxPercent: Number(item.taxPercent) || 0,
        taxValue: Number(item.taxValue) || 0,
        total: Number(item.total) || 0
      }));
      console.log('أصناف الفاتورة بعد التنظيف:', cleanedItems);
      // حذف الحقول الفارغة من بيانات الفاتورة
      const cleanedInvoiceData = Object.fromEntries(
        Object.entries(invoiceData).filter(([_, v]) => v !== '' && v !== undefined && v !== null)
      );
      // ابحث عن معرف المستند الحقيقي أولاً
      const { query, where, getDocs, setDoc, doc } = await import('firebase/firestore');
      const invoicesQuery = query(collection(db, 'sales_invoices'), where('invoiceNumber', '==', invoiceData.invoiceNumber));
      const invoicesSnap = await getDocs(invoicesQuery);
      if (!invoicesSnap.empty) {
        const realDocId = invoicesSnap.docs[0].id;
        const invoiceRef = doc(db, 'sales_invoices', realDocId);
        await setDoc(invoiceRef, {
          ...cleanedInvoiceData,
          items: cleanedItems,
          updatedAt: new Date().toISOString(),
        }, { merge: true });
        message.success('تم تحديث الفاتورة بنجاح');
      } else {
        message.error('لم يتم العثور على الفاتورة لتعديلها');
      }
    } catch (err) {
      console.error('Firestore error:', err);
      message.error('حدث خطأ أثناء تحديث الفاتورة: ' + (err?.message || err));
    }
  };
  // جلب الفروع والمخازن وطرق الدفع وقائمة الأصناف من Firestore
  useEffect(() => {
    const fetchLists = async () => {
      try {
        const branchesSnap = await getDocs(collection(db, 'branches'));
        const branchesList = branchesSnap.docs.map(doc => ({ id: doc.id, name: doc.data().name }));
        setBranches(branchesList);
      } catch (err) {}
      try {
        const warehousesSnap = await getDocs(collection(db, 'warehouses'));
        const warehousesList = warehousesSnap.docs.map(doc => ({ id: doc.id, name: doc.data().name }));
        setWarehouses(warehousesList);
      } catch (err) {}
      try {
        const paymentSnap = await getDocs(collection(db, 'payment_methods'));
        if (paymentSnap.empty) {
          setPaymentMethods([]);
          console.log('No payment methods found in Firestore.');
        } else {
          const paymentList = paymentSnap.docs.map(doc => ({ id: doc.id, name: doc.data().name || doc.id }));
          setPaymentMethods(paymentList);
          console.log('Loaded payment methods:', paymentList);
        }
      } catch (err) {
        console.error('Error loading payment methods:', err);
      }
      // جلب العملاء من قاعدة البيانات
      try {
        const customersSnap = await getDocs(collection(db, 'customers'));
        const customersList = customersSnap.docs.map(doc => ({
          id: doc.id,
          nameAr: doc.data().nameAr || '',
          nameEn: doc.data().nameEn || '',
          customerPhone: doc.data().customerPhone || '',
          mobile: doc.data().mobile || '',
          commercialRecord: doc.data().commercialRecord || '',
          taxFile: doc.data().taxFile || ''
        }));
        setCustomers(customersList);
      } catch (err) {}
      // جلب الأصناف من قاعدة البيانات inventory_items
      // جلب المندوبين من قاعدة البيانات delegates
      try {
        const delegatesSnap = await getDocs(collection(db, 'delegates'));
        const delegatesList = delegatesSnap.docs.map(doc => ({ id: doc.id, name: doc.data().name || doc.id }));
        setDelegates(delegatesList);
      } catch (err) {
        console.error('Error loading delegates:', err);
      }
      try {
        const itemsSnap = await getDocs(collection(db, 'inventory_items'));
        const itemsArr = itemsSnap.docs.map(doc => ({
          id: doc.data().id?.toString() || doc.id,
          name: doc.data().name,
          itemCode: doc.data().itemCode || '',
          salePrice: doc.data().salePrice || ''
        }));
        setItemsList(itemsArr);
      } catch (err) {
        console.error('Error loading items:', err);
      }
    };
    fetchLists();
  }, []);
  // تعريف الحالة الأساسية للنموذج والجدول
  const [invoiceData, setInvoiceData] = useState<InvoiceData>({
    invoiceNumber: '',
    entryNumber: '',
    date: dayjs().format('YYYY-MM-DD'),
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
  const [items, setItems] = useState<InvoiceItem[]>([]);

  // حساب الإجماليات
  const totals = useMemo(() => {
    let total = 0, discount = 0, afterDiscount = 0, tax = 0, net = 0;
    items.forEach(item => {
      const quantity = Math.max(0, Number(item.quantity) || 0);
      const price = Math.max(0, Number(item.price) || 0);
      const discountPercent = Math.min(100, Math.max(0, Number(item.discountPercent) || 0));
      const taxPercent = Math.max(0, Number(item.taxPercent) || 0);
      const subtotal = price * quantity;
      const discountValue = subtotal * (discountPercent / 100);
      const taxableAmount = subtotal - discountValue;
      const taxValue = taxableAmount * (taxPercent / 100);
      total += subtotal;
      discount += discountValue;
      afterDiscount += taxableAmount;
      tax += taxValue;
      net += taxableAmount + taxValue;
    });
    return {
      total: total.toFixed(2),
      discount: discount.toFixed(2),
      afterDiscount: afterDiscount.toFixed(2),
      tax: tax.toFixed(2),
      net: net.toFixed(2)
    };
  }, [items]);

  // عند تحميل الصفحة أو تغيير رقم الفاتورة، اجلب بيانات الفاتورة
  useEffect(() => {
    const fetchInvoice = async () => {
      console.log('invoiceParam from URL:', invoiceParam);
      if (!invoiceParam) return;
      try {
        // ابحث في sales_invoices باستخدام استعلام where
        const { query, where, getDocs } = await import('firebase/firestore');
        const invoicesQuery = query(collection(db, 'sales_invoices'), where('invoiceNumber', '==', invoiceParam));
        const invoicesSnap = await getDocs(invoicesQuery);
        console.log('sales_invoices query size:', invoicesSnap.size);
        if (!invoicesSnap.empty) {
          const docSnap = invoicesSnap.docs[0];
          const data = docSnap.data();
          setItems(Array.isArray(data.items) ? data.items : []);
          // Find payment method id by name if needed
          let paymentMethodId = '';
          if (data.paymentMethod) {
            // Try to find by name in paymentMethods
            const found = paymentMethods.find(m => m.name === data.paymentMethod || m.id === data.paymentMethod);
            paymentMethodId = found ? found.id : data.paymentMethod;
          }
          setInvoiceData(prev => ({
            invoiceNumber: data.invoiceNumber || invoiceParam,
            entryNumber: data.entryNumber || '',
            date: data.date || dayjs().format('YYYY-MM-DD'),
            paymentMethod: paymentMethodId,
            branch: data.branch || '',
            warehouse: data.warehouse || '',
            customerNumber: data.customerNumber || '',
            customerName: data.customerName || '',
            delegate: data.delegate || '',
            priceRule: data.priceRule || '',
            commercialRecord: data.commercialRecord || '',
            taxFile: data.taxFile || ''
          }));
          return;
        }
        // ابحث في sales_returns باستخدام استعلام where
        const returnsQuery = query(collection(db, 'sales_returns'), where('invoiceNumber', '==', invoiceParam));
        const returnsSnap = await getDocs(returnsQuery);
        console.log('sales_returns query size:', returnsSnap.size);
        if (!returnsSnap.empty) {
          const docSnap = returnsSnap.docs[0];
          const data = docSnap.data();
          setItems(Array.isArray(data.items) ? data.items : []);
          // Find payment method id by name if needed
          let paymentMethodId = '';
          if (data.paymentMethod) {
            const found = paymentMethods.find(m => m.name === data.paymentMethod || m.id === data.paymentMethod);
            paymentMethodId = found ? found.id : data.paymentMethod;
          }
          setInvoiceData(prev => ({
            invoiceNumber: data.referenceNumber || data.invoiceNumber || invoiceParam,
            entryNumber: data.entryNumber || '',
            date: data.date || dayjs().format('YYYY-MM-DD'),
            paymentMethod: paymentMethodId,
            branch: data.branch || '',
            warehouse: data.warehouse || '',
            customerNumber: data.customerNumber || '',
            customerName: data.customerName || '',
            delegate: data.delegate || data.seller || '',
            priceRule: data.priceRule || '',
            commercialRecord: data.commercialRecord || '',
            taxFile: data.taxFile || ''
          }));
          return;
        }
        message.error('لم يتم العثور على الفاتورة');
      } catch (err) {
        message.error('حدث خطأ أثناء جلب بيانات الفاتورة');
      }
    };
    fetchInvoice();
  }, [invoiceParam, paymentMethods]);

  // تعريف أعمدة الجدول كما في صفحة المبيعات (مختصر)
  const itemColumns = [
    { title: 'كود الصنف', dataIndex: 'itemNumber', width: 100 },
    { title: 'اسم الصنف', dataIndex: 'itemName', width: 150 },
    { title: 'الكمية', dataIndex: 'quantity', width: 80 },
    { title: 'الوحدة', dataIndex: 'unit', width: 80 },
    { title: 'السعر', dataIndex: 'price', width: 100 },
    { title: '% الخصم', dataIndex: 'discountPercent', width: 80 },
    { title: 'قيمة الخصم', dataIndex: 'discountValue', width: 100 },
    { title: 'الإجمالي بعد الخصم', dataIndex: 'afterDiscount', width: 120,
      render: (_, record) => {
        const quantity = Math.max(0, Number(record.quantity) || 0);
        const price = Math.max(0, Number(record.price) || 0);
        const discountPercent = Math.min(100, Math.max(0, Number(record.discountPercent) || 0));
        const subtotal = price * quantity;
        const discountValue = subtotal * (discountPercent / 100);
        const afterDiscount = subtotal - discountValue;
        return afterDiscount.toFixed(2);
      }
    },
    { title: '% الضريبة', dataIndex: 'taxPercent', width: 80 },
    { title: 'قيمة الضريبة', dataIndex: 'taxValue', width: 100 },
    { title: 'الإجمالي', dataIndex: 'total', width: 100,
      render: (_, record) => {
        const quantity = Math.max(0, Number(record.quantity) || 0);
        const price = Math.max(0, Number(record.price) || 0);
        const discountPercent = Math.min(100, Math.max(0, Number(record.discountPercent) || 0));
        const taxPercent = Math.max(0, Number(record.taxPercent) || 0);
        const subtotal = price * quantity;
        const discountValue = subtotal * (discountPercent / 100);
        const taxableAmount = subtotal - discountValue;
        const taxValue = taxableAmount * (taxPercent / 100);
        const netTotal = taxableAmount + taxValue;
        return netTotal.toFixed(2);
      }
    },
    {
      title: 'الإجراءات',
      key: 'actions',
      width: 120,
      render: (_, record, idx) => (
        <span>
          <Button onClick={() => handleEditItem(idx)}><EditOutlined /></Button>
          <Button onClick={() => handleDeleteItem(idx)} disabled={false}><DeleteOutlined /></Button>
        </span>
      )
    }
  ];
  // ...existing code...
  // دالة حذف صنف من الجدول
  const handleDeleteItem = (idx: number) => {
    const newItems = items.filter((_, i) => i !== idx);
    setItems(newItems);
    message.success('تم حذف الصنف من الفاتورة بنجاح');
    // تحديث الفاتورة في قاعدة البيانات مباشرة بعد الحذف
    const updateAfterDelete = async () => {
      try {
        if (!invoiceData.invoiceNumber) return;
        const cleanedItems = newItems.map(item => ({
          itemNumber: item.itemNumber,
          itemName: item.itemName,
          quantity: Number(item.quantity) || 0,
          unit: item.unit,
          price: Number(item.price) || 0,
          discountPercent: Number(item.discountPercent) || 0,
          discountValue: Number(item.discountValue) || 0,
          taxPercent: Number(item.taxPercent) || 0,
          taxValue: Number(item.taxValue) || 0,
          total: Number(item.total) || 0
        }));
        const cleanedInvoiceData = Object.fromEntries(
          Object.entries(invoiceData).filter(([_, v]) => v !== '' && v !== undefined && v !== null)
        );
        // ابحث عن معرف المستند الحقيقي أولاً
        const { query, where, getDocs, setDoc, doc } = await import('firebase/firestore');
        const invoicesQuery = query(collection(db, 'sales_invoices'), where('invoiceNumber', '==', invoiceData.invoiceNumber));
        const invoicesSnap = await getDocs(invoicesQuery);
        if (!invoicesSnap.empty) {
          const realDocId = invoicesSnap.docs[0].id;
          const invoiceRef = doc(db, 'sales_invoices', realDocId);
          await setDoc(invoiceRef, {
            ...cleanedInvoiceData,
            items: cleanedItems,
            updatedAt: new Date().toISOString(),
          }, { merge: true });
          message.success('تم حفظ التغييرات في قاعدة البيانات');
        } else {
          message.error('لم يتم العثور على الفاتورة لتعديلها');
        }
      } catch (err) {
        message.error('حدث خطأ أثناء حفظ التغييرات: ' + (err?.message || err));
      }
    };
    updateAfterDelete();
  };

  // دالة تعديل صنف من الجدول
  const handleEditItem = (idx: number) => {
    const itemToEdit = items[idx];
    setItem({ ...itemToEdit });
    // احذف الصنف من الجدول مؤقتاً حتى يتم إعادة إضافته بعد التعديل
    const newItems = items.filter((_, i) => i !== idx);
    setItems(newItems);
    // تحديث الفاتورة في قاعدة البيانات مباشرة بعد حذف الصنف مؤقتاً
    const updateAfterEdit = async () => {
      try {
        if (!invoiceData.invoiceNumber) return;
        const cleanedItems = newItems.map(item => ({
          itemNumber: item.itemNumber,
          itemName: item.itemName,
          quantity: Number(item.quantity) || 0,
          unit: item.unit,
          price: Number(item.price) || 0,
          discountPercent: Number(item.discountPercent) || 0,
          discountValue: Number(item.discountValue) || 0,
          taxPercent: Number(item.taxPercent) || 0,
          taxValue: Number(item.taxValue) || 0,
          total: Number(item.total) || 0
        }));
        const cleanedInvoiceData = Object.fromEntries(
          Object.entries(invoiceData).filter(([_, v]) => v !== '' && v !== undefined && v !== null)
        );
        // ابحث عن معرف المستند الحقيقي أولاً
        const { query, where, getDocs, setDoc, doc } = await import('firebase/firestore');
        const invoicesQuery = query(collection(db, 'sales_invoices'), where('invoiceNumber', '==', invoiceData.invoiceNumber));
        const invoicesSnap = await getDocs(invoicesQuery);
        if (!invoicesSnap.empty) {
          const realDocId = invoicesSnap.docs[0].id;
          const invoiceRef = doc(db, 'sales_invoices', realDocId);
          await setDoc(invoiceRef, {
            ...cleanedInvoiceData,
            items: cleanedItems,
            updatedAt: new Date().toISOString(),
          }, { merge: true });
          message.success('تم حفظ التغييرات في قاعدة البيانات بعد التعديل');
        } else {
          message.error('لم يتم العثور على الفاتورة لتعديلها');
        }
      } catch (err) {
        message.error('حدث خطأ أثناء حفظ التغييرات: ' + (err?.message || err));
      }
    };
    updateAfterEdit();
  };
  return (
    <div className="p-2 sm:p-6 w-full max-w-none">
      <Breadcrumb
        items={[{ label: "الرئيسية", to: "/" }, { label: "تعديل فاتورة مبيعات" }]}
      /> 
        <div className="p-2 bg-white  sm:p-6 w-full max-w-none">
 
      <Form layout="vertical">
        <Row gutter={16} className="mb-4">
          <Col xs={24} sm={12} md={6}>
            <Form.Item label="رقم الفاتورة">
              <Input id="invoiceNumber" value={invoiceData.invoiceNumber} placeholder="رقم الفاتورة" disabled />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Form.Item label="رقم القيد">
              <Input id="entryNumber" value={invoiceData.entryNumber} placeholder="رقم القيد" disabled />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Form.Item label="التاريخ">
              <Input id="date" value={invoiceData.date} placeholder="التاريخ" disabled />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Form.Item label="طريقة الدفع">
              <Select
                id="paymentMethod"
                value={invoiceData.paymentMethod}
                placeholder="اختر طريقة الدفع"
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) => {
                  const label = option?.children ? option.children.toString() : '';
                  const value = option?.value ? option.value.toString() : '';
                  return label.toLowerCase().includes(input.toLowerCase()) || value.toLowerCase().includes(input.toLowerCase());
                }}
                onChange={value => setInvoiceData(prev => ({ ...prev, paymentMethod: value }))}
              >
                {paymentMethods.map(m => (
                  <Option key={m.id} value={m.id}>
                    {m.name || m.id}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Form.Item label="الفرع">
              <Select
                id="branch"
                value={invoiceData.branch}
                placeholder="اختر الفرع"
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) => {
                  const label = option?.children ? option.children.toString() : '';
                  const value = option?.value ? option.value.toString() : '';
                  return label.toLowerCase().includes(input.toLowerCase()) || value.toLowerCase().includes(input.toLowerCase());
                }}
                onChange={value => setInvoiceData(prev => ({ ...prev, branch: value }))}
              >
                {branches.map(b => (
                  <Option key={b.id} value={b.id}>
                    {b.name || b.id}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Form.Item label="المخزن">
              <Select
                id="warehouse"
                value={invoiceData.warehouse}
                placeholder="اختر المخزن"
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) => {
                  const label = option?.children ? option.children.toString() : '';
                  const value = option?.value ? option.value.toString() : '';
                  return label.toLowerCase().includes(input.toLowerCase()) || value.toLowerCase().includes(input.toLowerCase());
                }}
                onChange={value => setInvoiceData(prev => ({ ...prev, warehouse: value }))}
              >
                {warehouses.map(w => (
                  <Option key={w.id} value={w.id}>
                    {w.name || w.id}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Form.Item label="رقم العميل">
              <Input id="customerNumber" value={invoiceData.customerNumber} placeholder="رقم العميل" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Form.Item label="اسم العميل">
              <Select
                id="customerName"
                value={invoiceData.customerName}
                placeholder="اختر اسم العميل"
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) => {
                  const label = option?.children ? option.children.toString() : '';
                  const value = option?.value ? option.value.toString() : '';
                  return label.toLowerCase().includes(input.toLowerCase()) || value.toLowerCase().includes(input.toLowerCase());
                }}
                onChange={value => {
                  // ابحث عن العميل المختار
                  const selectedCustomer = customers.find(c => (c.nameAr || c.nameEn || c.id) === value);
                  setInvoiceData(prev => ({
                    ...prev,
                    customerName: value,
                    customerNumber: selectedCustomer ? (selectedCustomer.customerPhone || selectedCustomer.mobile || selectedCustomer.id) : '',
                    commercialRecord: selectedCustomer?.commercialRecord || '',
                    taxFile: selectedCustomer?.taxFile || ''
                  }));
                }}
              >
                {customers.map(c => (
                  <Option key={c.id} value={c.nameAr || c.nameEn || c.id}>
                    {c.nameAr || c.nameEn || c.id}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Form.Item label="المندوب">
              <Select
                id="delegate"
                value={invoiceData.delegate}
                placeholder="اختر المندوب"
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) => {
                  const label = option?.children ? option.children.toString() : '';
                  const value = option?.value ? option.value.toString() : '';
                  return label.toLowerCase().includes(input.toLowerCase()) || value.toLowerCase().includes(input.toLowerCase());
                }}
                onChange={value => setInvoiceData(prev => ({ ...prev, delegate: value }))}
              >
                {delegates.map(d => (
                  <Option key={d.id} value={d.name}>
                    {d.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Form.Item label="سياسة التسعير">
              <Select
                id="priceRule"
                value={invoiceData.priceRule}
                placeholder="اختر سياسة التسعير"
                onChange={value => setInvoiceData(prev => ({ ...prev, priceRule: value }))}
                style={{ width: '100%' }}
              >
                <Option value="salePrice">سعر البيع</Option>
                <Option value="lastCustomerPrice">آخر سعر للعميل</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Form.Item label="السجل التجاري">
              <Input id="commercialRecord" value={invoiceData.commercialRecord} placeholder="السجل التجاري" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Form.Item label="الملف الضريبي">
              <Input id="taxFile" value={invoiceData.taxFile} placeholder="الملف الضريبي" />
            </Form.Item>
          </Col>
        </Row>
      </Form>
      {/* فورم إضافة صنف جديد */}
      <Divider orientation="left">إضافة صنف للفاتورة</Divider>
      <Form layout="vertical" style={{ marginBottom: 16 }}>
        <Row gutter={[8, 8]} align="middle" justify="start">
          <Col span={3}>
            <Form.Item label="كود الصنف" style={{ marginBottom: 0 }}>
              <Input value={item.itemNumber} disabled placeholder="كود الصنف" />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="اسم الصنف" style={{ marginBottom: 0 }}>
              <Select
                value={item.itemName}
                showSearch
                placeholder={itemsList.length === 0 ? "اختر اسم الصنف" : "اختر اسم الصنف"}
                optionFilterProp="label"
                filterOption={(input, option) =>
                  (option?.label ?? '').toString().toLowerCase().includes(input.toLowerCase())
                }
                onChange={handleSelectItemName}
                style={{ width: '100%' }}
                disabled={itemsList.length === 0}
                options={
                  itemsList.length === 0
                    ? [{ label: "اختر اسم الصنف", value: "", disabled: true }]
                    : itemsList.map(i => ({ label: i.name, value: i.name }))
                }
              />
            </Form.Item>
          </Col>
          <Col span={2}>
            <Form.Item label="الكمية" style={{ marginBottom: 0 }}>
              <Input
                type="number"
                min={1}
                value={item.quantity}
                onChange={e => {
                  // فقط أرقام موجبة
                  const val = e.target.value.replace(/[^\d]/g, '');
                  setItem(prev => ({ ...prev, quantity: val === '' ? '1' : val }));
                }}
                placeholder="الكمية"
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Col>
          <Col span={3}>
            <Form.Item label="الوحدة" style={{ marginBottom: 0 }}>
              <Input value={item.unit} onChange={e => setItem(prev => ({ ...prev, unit: e.target.value }))} placeholder="الوحدة" />
            </Form.Item>
          </Col>
          <Col span={3}>
            <Form.Item label="السعر" style={{ marginBottom: 0 }}>
              <InputNumber
                min={0}
                value={item.price === '' ? undefined : Number(item.price)}
                onChange={val => setItem(prev => ({ ...prev, price: val === null || val === undefined ? '' : val.toString() }))}
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Col>
          <Col span={2}>
            <Form.Item label="% الخصم" style={{ marginBottom: 0 }}>
              <InputNumber
                min={0}
                max={100}
                value={item.discountPercent === '' ? undefined : Number(item.discountPercent)}
                onChange={val => setItem(prev => ({ ...prev, discountPercent: val === null || val === undefined ? '' : val.toString() }))}
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Col>
          <Col span={2}>
            <Form.Item label="% الضريبة" style={{ marginBottom: 0 }}>
              <InputNumber
                min={0}
                max={100}
                value={item.taxPercent === '' ? undefined : Number(item.taxPercent)}
                onChange={val => setItem(prev => ({ ...prev, taxPercent: val === null || val === undefined ? '' : val.toString() }))}
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Col>
          <Col span={3} style={{ display: 'flex', alignItems: 'center' }}>
            <Button type="primary" icon={<PlusOutlined />} onClick={addItem} style={{ marginTop: 24, width: '100%' }}>
              إضافة 
            </Button>
          </Col>
        </Row>
      </Form>
      <Divider orientation="left">أصناف الفاتورة</Divider>
      <Table
        columns={typeof itemColumns !== 'undefined' ? itemColumns : []}
        dataSource={typeof items !== 'undefined' ? items : []}
        pagination={false}
        bordered
        size="middle"
        className="custom-table-header"
        summary={() => (
          <Table.Summary fixed>
            <Table.Summary.Row>
              <Table.Summary.Cell index={0} colSpan={5} style={{ textAlign: 'right', fontWeight: 'bold', background: '#e6f7ff' }}>الإجماليات</Table.Summary.Cell>
              {/* السعر */}

              {/* <Table.Summary.Cell index={5} style={{ textAlign: 'center', fontWeight: 'bold' }}>{totals.total}</Table.Summary.Cell> */}
              {/* % الخصم */}
              <Table.Summary.Cell index={6}></Table.Summary.Cell>
              {/* قيمة الخصم */}
              <Table.Summary.Cell index={7} style={{ textAlign: 'center', color: '#faad14', fontWeight: 'bold' }}>{totals.discount}</Table.Summary.Cell>
              {/* الإجمالي بعد الخصم */}
              <Table.Summary.Cell index={8} style={{ textAlign: 'center', fontWeight: 'bold' }}>{totals.afterDiscount}</Table.Summary.Cell>
              {/* % الضريبة */}
              <Table.Summary.Cell index={9}></Table.Summary.Cell>
              {/* قيمة الضريبة */}
              <Table.Summary.Cell index={10} style={{ textAlign: 'center', color: '#52c41a', fontWeight: 'bold' }}>{totals.tax}</Table.Summary.Cell>
              {/* الإجمالي النهائي */}
              <Table.Summary.Cell index={11} style={{ textAlign: 'center', color: '#d4380d', fontWeight: 'bold', fontSize: 16 }}>{totals.net}</Table.Summary.Cell>
            </Table.Summary.Row>
          </Table.Summary>
        )}
      />
      <style>{`
        .custom-table-header .ant-table-thead > tr > th {
          background: #e6f7ff !important;
        }
      `}</style>
      {/* الإجماليات بنفس تنسيق صفحة المبيعات */}
  
      {/* يمكنك لاحقاً تخصيص زر "حفظ" ليكون "تحديث" */}
      <div style={{ textAlign: 'left', marginTop: 24 }}>
        <Button type="primary" icon={<SaveOutlined />} onClick={updateInvoice}>
          تحديث الفاتورة
        </Button>
      </div>
      </div>
    </div>
  );
};

export default EditSalesPage;
