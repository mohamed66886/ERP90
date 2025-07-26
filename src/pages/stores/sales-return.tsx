import React, { useState, useEffect } from 'react';
import { Input, InputNumber, Button, Table, message, Card, Spin, Row, Col, Select } from 'antd';
import { SearchOutlined, PrinterOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import Breadcrumb from '../../components/Breadcrumb';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { useAutoAnimate } from '@formkit/auto-animate/react';

// Types
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
  returnedQty?: string;
  previousReturns?: number;
}

interface InvoiceData {
  invoiceNumber: string;
  entryNumber: string;
  accountingPeriod: string;
  date: string;
  warehouse: string;
  branch: string;
  customerNumber: string;
  customerName: string;
  reason: string;
  seller: string;
  customReason?: string;
}

interface InvoiceTotals {
  total: number;
  discountPercent: number;
  discountValue: number;
  taxValue: number;
  net: number;
}

const initialInvoiceData: InvoiceData = {
  invoiceNumber: '',
  entryNumber: '',
  accountingPeriod: '',
  date: '',
  warehouse: '',
  branch: '',
  customerNumber: '',
  customerName: '',
  reason: '',
  seller: '',
  customReason: '',
};

const initialTotals: InvoiceTotals = {
  total: 0,
  discountPercent: 0,
  discountValue: 0,
  taxValue: 0,
  net: 0
};
const SalesReturnPage: React.FC = () => {
  // حفظ معرف المخزن الأصلي من الفاتورة
  const [originalWarehouseId, setOriginalWarehouseId] = useState<string>('');
  // قائمة المخازن
  const [warehouseOptions, setWarehouseOptions] = useState<{ id: string; name: string }[]>([]);
  // جلب قائمة المخازن من قاعدة البيانات
  useEffect(() => {
    const fetchWarehouses = async () => {
      try {
        const { getDocs, collection } = await import('firebase/firestore');
        const { db } = await import('../../lib/firebase');
        const snap = await getDocs(collection(db, 'warehouses'));
        const options = snap.docs.map(doc => ({ id: doc.id, name: doc.data().name || doc.id }));
        setWarehouseOptions(options);
      } catch {
        setWarehouseOptions([]);
      }
    };
    fetchWarehouses();
  }, []);

  // حفظ المرتجع
  const handleSaveReturn = async () => {
    if (!invoiceData.invoiceNumber) {
      message.error('يجب اختيار الفاتورة أولاً');
      return;
    }
    if (!paymentMethod) {
      message.error('يجب اختيار طريقة الدفع');
      return;
    }
    // تحقق قبل الحفظ: منع حفظ المرتجع إذا تجاوزت المرتجعات السابقة كمية الصنف
    const invalidReturn = items.some(item => {
      const returnedQty = Number(item.returnedQty) || 0;
      const previousReturns = Number(item.previousReturns) || 0;
      const quantity = Number(item.quantity);
      return returnedQty > 0 && (previousReturns + returnedQty > quantity);
    });
    if (invalidReturn) {
      message.error('لا يمكن أن يكون مجموع المرتجعات السابقة والكمية المرتجعة أكبر من كمية الصنف الأصلية');
      return;
    }
    try {
      const { addDoc, collection, getDoc, doc: docRef, updateDoc } = await import('firebase/firestore');
      const { db } = await import('../../lib/firebase');
      // جلب اسم المخزن من قاعدة البيانات
      let warehouseName = '';
      if (originalWarehouseId) {
        try {
          const warehouseDoc = await getDoc(docRef(db, 'warehouses', originalWarehouseId));
          if (warehouseDoc.exists()) {
            const data = warehouseDoc.data();
            warehouseName = data.name || originalWarehouseId;
          } else {
            warehouseName = originalWarehouseId;
          }
        } catch {
          warehouseName = originalWarehouseId;
        }
      }
      // حفظ كل صنف مع معرف واسم المخزن
      // فقط الأصناف التي الكمية المرتجعة لها أكبر من صفر
      const itemsWithWarehouse = items
        .map(item => ({
          itemNumber: item.itemNumber,
          itemName: item.itemName,
          quantity: item.quantity,
          unit: item.unit,
          price: item.price,
          discountPercent: item.discountPercent,
          discountValue: item.discountValue,
          taxPercent: item.taxPercent,
          taxValue: item.taxValue,
          total: item.total,
          warehouseId: originalWarehouseId,
          warehouseName: warehouseName,
          returnedQty: Number(item.returnedQty) || 0
        }))
        .filter(item => item.returnedQty > 0);

      // إذا لم يوجد أي صنف مرتجع، لا تحفظ المرتجع
      if (itemsWithWarehouse.length === 0) {
        message.error('يجب إدخال كمية مرتجعة واحدة على الأقل');
        return;
      }

      // حفظ المرتجع أولاً
      await addDoc(collection(db, 'sales_returns'), {
        referenceNumber,
        invoiceNumber: invoiceData.invoiceNumber,
        entryNumber: invoiceData.entryNumber,
        accountingPeriod: invoiceData.accountingPeriod,
        date: invoiceData.date,
        warehouse: originalWarehouseId,
        branch: invoiceData.branch,
        customerNumber: invoiceData.customerNumber,
        customerName: invoiceData.customerName,
        reason: invoiceData.reason,
        seller: invoiceData.seller,
        customReason: invoiceData.customReason || '',
        paymentMethod,
        items: itemsWithWarehouse,
        totals,
        createdAt: new Date().toISOString()
      });

      // تحديث الفاتورة الأصلية في sales_invoices
      // جلب الفاتورة الأصلية
      const { getDocs, query, where } = await import('firebase/firestore');
      const invoiceQuery = query(collection(db, 'sales_invoices'), where('invoiceNumber', '==', invoiceData.invoiceNumber));
      const invoiceSnap = await getDocs(invoiceQuery);
      if (!invoiceSnap.empty) {
        const invoiceDocRef = invoiceSnap.docs[0].ref;
        const invoiceDocData = invoiceSnap.docs[0].data();
        // تحديث الأصناف وحذف أي صنف أصبحت كميته صفر
        const updatedItems = (invoiceDocData.items || [])
          .map((item: any) => {
            const returned = itemsWithWarehouse.find(ret => ret.itemNumber === item.itemNumber);
            if (returned && returned.returnedQty > 0) {
              let previousReturns = (item.previousReturns || 0) + Number(returned.returnedQty);
              const maxReturns = Number(item.quantity);
              if (previousReturns > maxReturns) previousReturns = maxReturns;
              return {
                ...item,
                previousReturns: previousReturns // فقط تحديث المرتجعات السابقة
              };
            }
            // إذا كان الصنف لم يتم إرجاعه، يجب الحفاظ على قيمة previousReturns كما هي
            return {
              ...item,
              previousReturns: item.previousReturns || 0
            };
          });
        await updateDoc(invoiceDocRef, { items: updatedItems });
      }

      // تحديث بيانات الأصناف في الواجهة ليظهر عدد المرتجعات السابقة مباشرة
      setItems(prevItems => prevItems.map(item => {
        const returned = itemsWithWarehouse.find(ret => ret.itemNumber === item.itemNumber);
        if (returned && returned.returnedQty > 0) {
          let previousReturns = (item.previousReturns || 0) + Number(returned.returnedQty);
          const maxReturns = Number(item.quantity);
          if (previousReturns > maxReturns) previousReturns = maxReturns;
          return {
            ...item,
            previousReturns: previousReturns
          };
        }
        return item;
      }));
      message.success('تم حفظ المرتجع وتحديث الفاتورة بنجاح');
    } catch (err) {
      message.error('حدث خطأ أثناء حفظ المرتجع أو تحديث الفاتورة');
    }
  };
  // خيارات طرق الدفع من قاعدة البيانات
  const [paymentOptions, setPaymentOptions] = useState<{ id: string; name: string }[]>([]);

  // جلب طرق الدفع من قاعدة البيانات
  useEffect(() => {
    const fetchPaymentOptions = async () => {
      try {
        const { getDocs, collection } = await import('firebase/firestore');
        const { db } = await import('../../lib/firebase');
        const snap = await getDocs(collection(db, 'paymentMethods'));
        const options = snap.docs.map(doc => ({ id: doc.id, name: doc.data().name }));
        setPaymentOptions(options);
      } catch {
        setPaymentOptions([]);
      }
    };
    fetchPaymentOptions();
  }, []);
  // طريقة الدفع
  const [paymentMethod, setPaymentMethod] = useState('');
  // State
  const [invoiceNumber, setInvoiceNumber] = useState('');
  // رقم المرجع تلقائي
  const [referenceNumber] = useState(() => {
    // يمكن توليد رقم عشوائي أو بناء على الوقت
    return 'REF-' + Date.now();
  });
  const [invoiceData, setInvoiceData] = useState<InvoiceData>(initialInvoiceData);
  const [totals, setTotals] = useState<InvoiceTotals>(initialTotals);
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [parent] = useAutoAnimate();
  const [isMobile, setIsMobile] = useState(false);

  // Check for mobile view
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // جلب اسم المخزن من معرفه
  const fetchWarehouseName = async (warehouseId: string) => {
    if (!warehouseId) return 'غير محدد';
    try {
      const { getDoc, doc: docRef } = await import('firebase/firestore');
      const { db } = await import('../../lib/firebase');
      const warehouseDoc = await getDoc(docRef(db, 'warehouses', warehouseId));
      if (warehouseDoc.exists()) {
        const data = warehouseDoc.data();
        if (data.name && data.name.trim() !== '') {
          return data.name;
        } else {
          return '(اسم المخزن غير متوفر)';
        }
      }
      return '(المخزن غير موجود)';
    } catch {
      return '(تعذر جلب اسم المخزن)';
    }
  };

  // جلب اسم الفرع من معرفه
  const fetchBranchName = async (branchId: string) => {
    if (!branchId) return '';
    try {
      const { getDoc, doc: docRef } = await import('firebase/firestore');
      const { db } = await import('../../lib/firebase');
      const branchDoc = await getDoc(docRef(db, 'branches', branchId));
      if (branchDoc.exists()) {
        const data = branchDoc.data();
        return data.name || branchId;
      }
      return branchId;
    } catch {
      return branchId;
    }
  };
    // Fetch invoice data
  const fetchInvoiceData = async (number: string) => {
    if (!number) {
      message.warning('الرجاء إدخال رقم الفاتورة');
      return;
    }
    setLoading(true);
    try {
      // جلب بيانات الفاتورة من Firebase
      const { getDocs, collection, query, where } = await import('firebase/firestore');
      const { db } = await import('../../lib/firebase');
      const q = query(collection(db, 'sales_invoices'), where('invoiceNumber', '==', number));
      const snap = await getDocs(q);
      if (snap.empty) {
        message.error('لم يتم العثور على الفاتورة');
        setInvoiceData(initialInvoiceData);
        setTotals(initialTotals);
        setItems([]);
        setLoading(false);
        return;
      }
      const doc = snap.docs[0].data();
      // حفظ معرف المخزن الأصلي في state
      setOriginalWarehouseId(doc.warehouse || '');
      // جلب اسم الفرع الحقيقي
      let branchName = doc.branch || '';
      if (branchName) {
        branchName = await fetchBranchName(branchName);
      }
      setInvoiceData({
        invoiceNumber: doc.invoiceNumber || '',
        entryNumber: doc.entryNumber || '',
         accountingPeriod: dayjs().format('YYYY-MM'),
         date: dayjs().format('YYYY-MM-DD'),
        warehouse: doc.warehouse || '', // نضع معرف المخزن مباشرة
        branch: branchName,
        customerNumber: doc.customerNumber || '',
        customerName: doc.customerName || '',
        reason: '',
        seller: doc.delegate || doc.seller || ''
      });
      // جلب طريقة الدفع من الفاتورة
      setPaymentMethod(doc.paymentMethod || '');
      setTotals({
        total: doc.totals?.total || 0,
        discountPercent: doc.items?.[0]?.discountPercent ? Number(doc.items[0].discountPercent) : 0,
        discountValue: doc.totals?.total - doc.totals?.afterDiscount || 0,
        taxValue: doc.totals?.tax || 0,
        net: doc.totals?.afterTax || 0
      });
      setItems(
        (doc.items || []).map((item: any) => ({
          itemNumber: item.itemNumber,
          itemName: item.itemName,
          quantity: item.quantity,
          unit: item.unit,
          price: item.price,
          discountPercent: item.discountPercent,
          discountValue: item.discountValue,
          taxPercent: item.taxPercent,
          taxValue: item.taxValue,
          total: item.total,
          returnedQty: '',
          previousReturns: item.previousReturns || 0 // جلب المرتجعات السابقة من قاعدة البيانات
        }))
      );
      message.success('تم تحميل بيانات الفاتورة بنجاح');
    } catch (err) {
      message.error('حدث خطأ أثناء جلب البيانات');
      setInvoiceData(initialInvoiceData);
      setTotals(initialTotals);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };
    // Table columns
  const columns = [
    { title: 'كود الصنف', dataIndex: 'itemNumber', key: 'itemNumber', width: 100 },
    { title: 'اسم الصنف', dataIndex: 'itemName', key: 'itemName', width: 150 },
    { title: 'الكمية', dataIndex: 'quantity', key: 'quantity', width: 80 },
    { title: 'الوحدة', dataIndex: 'unit', key: 'unit', width: 80 },
    { 
      title: 'سعر الوحدة', 
      dataIndex: 'price', 
      key: 'price', 
      width: 100,
      render: (v: string) => parseFloat(v).toFixed(2)
    },
    { title: 'نسبة الخصم', dataIndex: 'discountPercent', key: 'discountPercent', width: 80 },
    { 
      title: 'قيمة الخصم', 
      dataIndex: 'discountValue', 
      key: 'discountValue', 
      width: 100,
      render: (v: number) => v.toFixed(2)
    },
    { 
      title: 'الصافي بعد الخصم', 
      key: 'netAfterDiscount', 
      width: 110,
      render: (_: unknown, r: InvoiceItem) => {
        const subtotal = Number(r.price) * Number(r.quantity);
        const discountValue = subtotal * Number(r.discountPercent) / 100;
        return (subtotal - discountValue).toFixed(2);
      }
    },
    { title: 'نسبة الضريبة', dataIndex: 'taxPercent', key: 'taxPercent', width: 80 },
    { 
      title: 'قيمة الضريبة', 
      dataIndex: 'taxValue', 
      key: 'taxValue', 
      width: 100,
      render: (v: number) => v.toFixed(2)
    },
    { 
      title: 'الكمية المرتجعة', 
      dataIndex: 'returnedQty', 
      key: 'returnedQty', 
      width: 100,
      render: (v: string, r: InvoiceItem, idx: number) => (
        <motion.div whileHover={{ scale: 1.05 }}>
          <InputNumber
            value={v ? Number(v) : 0}
            min={0}
            max={Number(r.quantity)}
            onChange={(val) => {
              setItems(items => items.map((it, i) => i === idx ? { ...it, returnedQty: val !== null ? val.toString() : '' } : it));
            }}
            style={{ width: 80 }}
          />
        </motion.div>
      )
    },
    { 
      title: 'الصافي المرتجع', 
      key: 'netReturned', 
      width: 110,
      render: (_: unknown, r: InvoiceItem) => {
        const returned = Number(r.returnedQty) || 0;
        const subtotal = Number(r.price) * returned;
        const discountValue = subtotal * Number(r.discountPercent) / 100;
        const taxValue = (subtotal - discountValue) * Number(r.taxPercent) / 100;
        return (subtotal - discountValue + taxValue).toFixed(2);
      }
    },
    { title: 'عدد المرتجعات السابقة', dataIndex: 'previousReturns', key: 'previousReturns', width: 100 },
  ];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100
      }
    },
    exit: { 
      y: -30, 
      opacity: 0,
      transition: { duration: 0.2 }
    }
  };

  const cardVariants = {
    hidden: { scale: 0.95, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        damping: 15,
        stiffness: 100
      }
    }
  };

  const buttonVariants = {
    hover: { scale: 1.03, boxShadow: "0 6px 16px rgba(0, 0, 0, 0.12)" },
    tap: { scale: 0.98 },
    initial: { scale: 1 }
  };

  const tableRowVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.05,
        duration: 0.5
      }
    })
  };
    return (
    <div 
      style={{ 

        padding: isMobile ? '16px' : '24px',
        maxWidth: '100%',
        overflowX: 'hidden',
        background: '#f8f9fa',
        minHeight: '100vh'
      }}
    >
            <div className="p-4 font-['Tajawal'] bg-white mb-4 rounded-lg shadow-[0_0_10px_rgba(0,0,0,0.1)] animate-[bounce_2s_infinite] relative overflow-hidden">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold  text-gray-800">مرتجع المبيعات </h1>
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
          { label: "مرتجع مبيعات" }
        ]}
      />


      {/* Page Header */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ 
          type: "spring",
          stiffness: 100,
          damping: 10
        }}
      >
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 16,
          marginBottom: 24
        }}>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{ cursor: 'pointer' }}
          >
          </motion.div>

        </div>
      </motion.div>

      {/* Invoice Search */}
      <motion.div
        variants={itemVariants}
        initial="hidden"
        animate="visible"
        style={{ 
          marginBottom: 24, 
          display: 'flex', 
          gap: 12, 
          flexWrap: 'wrap',
          alignItems: 'flex-end'
        }}
      >
        <motion.div 
          style={{ flex: 1, minWidth: 200 }}
          whileHover={{ scale: 1.01 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          <Input
            id="invoiceNumber"
            placeholder="رقم الفاتورة"
            value={invoiceNumber}
            onChange={e => setInvoiceNumber(e.target.value)}
            style={{ width: '100%' }}
            disabled={loading}
            allowClear
            size="large"
          />
        </motion.div>
        
        <motion.div
          variants={buttonVariants}
          initial="initial"
          whileHover="hover"
          whileTap="tap"
        >
          <Button
            type="primary"
            icon={<SearchOutlined />}
            loading={loading}
            onClick={() => fetchInvoiceData(invoiceNumber)}
            style={{ 
              width: isMobile ? '100%' : 'auto',
              height: 40,
              fontSize: 16
            }}
            size="large"
          >
            بحث
          </Button>
        </motion.div>
      </motion.div>
      {/* Invoice Data Sections */}
      <LayoutGroup>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          style={{ marginBottom: 32 }}
          ref={parent}
          layout
        >
          <AnimatePresence>
            {invoiceData.invoiceNumber && (
              <div style={{ width: '100%' }}>
                <Row gutter={[24, 24]}>
                  {/* Return Data */}
                  <Col xs={24} md={16}>
                    <motion.div
                      variants={cardVariants}
                      layout
                    >
                      <Card
                        title={
                          <motion.div 
                            layout
                            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                          >
                            <span style={{ fontWeight: 'bold', color: '#305496' }}>بيانات المرتجع</span>
                            <motion.div
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <Button type="text" icon={<PrinterOutlined />} size="small">طباعة</Button>
                            </motion.div>
                          </motion.div>
                        }
                        bordered={false}
                        style={{ 
                          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
                          borderRadius: 16,
                          height: '100%',
                          border: '1px solid #f0f0f0'
                        }}
                      >
                        <Spin spinning={loading}>
                          <Row gutter={[12, 16]}>
                            {[
              { id: 'refNum', label: 'رقم المرجع', value: referenceNumber },
              { id: 'invNum', label: 'رقم الفاتورة', value: invoiceData.invoiceNumber },
                              { id: 'entryNum', label: 'رقم القيد', value: invoiceData.entryNumber },
                              { id: 'accPeriod', label: 'الفترة المحاسبية', value: invoiceData.accountingPeriod },
                              { id: 'invDate', label: 'تاريخ المرتجع', value: invoiceData.date },
                              // حقل المخزن قابل للتغيير
                              {
                                id: 'warehouse',
                                label: 'المخزن',
                                value: invoiceData.warehouse,
                                render: () => (
                                  <Select
                                    id="warehouse"
                                    value={invoiceData.warehouse}
                                    placeholder="اختر المخزن"
                                    onChange={value => {
                                      setInvoiceData(d => ({ ...d, warehouse: value }));
                                      setOriginalWarehouseId(value);
                                    }}
                                    showSearch
                                    allowClear
                                    style={{ width: '100%' }}
                                    dropdownStyle={{ borderRadius: 12 }}
                                  >
                                    {warehouseOptions.length === 0 ? (
                                      <Select.Option value="" disabled>لا توجد مخازن متاحة</Select.Option>
                                    ) : (
                                      warehouseOptions.map(opt => (
                                        <Select.Option key={opt.id} value={opt.id}>{opt.name}</Select.Option>
                                      ))
                                    )}
                                  </Select>
                                )
                              },
                              { id: 'branch', label: 'الفرع', value: invoiceData.branch },
                              { id: 'custNum', label: 'رقم العميل', value: invoiceData.customerNumber },
                              { id: 'custName', label: 'اسم العميل', value: invoiceData.customerName },
                            ].map((field, index) => (
                              <Col key={field.id} span={8}>
                                <motion.div
                                  variants={itemVariants}
                                  custom={index}
                                >
                                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <label htmlFor={field.id} style={{ marginBottom: 6, fontWeight: 600, color: '#555' }}>
                                      {field.label}
                                    </label>
                                    {field.render ? field.render() : (
                                      <Input 
                                        id={field.id} 
                                        value={field.value} 
                                        disabled 
                                        style={{ 
                                          background: '#fafafa',
                                          borderRadius: 8,
                                          border: '1px solid #e0e0e0'
                                        }}
                                      />
                                    )}
                                  </div>
                                </motion.div>
                              </Col>
                            ))}
                            
                            {/* Reason Field */}
                            <Col span={8}>
                              <motion.div variants={itemVariants} custom={8}>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                  <label htmlFor="reason" style={{ marginBottom: 6, fontWeight: 600, color: '#555' }}>
                                    السبب
                                  </label>
                                  <Select
                                    id="reason"
                                    value={invoiceData.reason}
                                    placeholder="اختر السبب"
                                    onChange={value => setInvoiceData(d => ({ ...d, reason: value, customReason: value === 'سبب آخر' ? '' : undefined }))}
                                    showSearch
                                    allowClear
                                    style={{ width: '100%' }}
                                    dropdownStyle={{ borderRadius: 12 }}
                                  >
                                    <Select.Option value="عميل غير راضٍ">عميل غير راضٍ</Select.Option>
                                    <Select.Option value="خطأ في الفاتورة">خطأ في الفاتورة</Select.Option>
                                    <Select.Option value="تلف أو عيب بالصنف">تلف أو عيب بالصنف</Select.Option>
                                    <Select.Option value="تغيير رأي العميل">تغيير رأي العميل</Select.Option>
                                    <Select.Option value="تسوية محاسبية">تسوية محاسبية</Select.Option>
                                    <Select.Option value="سبب آخر">سبب آخر</Select.Option>
                                  </Select>
                                </div>
                              </motion.div>
                            </Col>
                            
                            {/* Seller and Custom Reason */}
                            <Col span={16}>
                              <motion.div 
                                style={{ display: 'flex', gap: 12 }}
                                variants={itemVariants}
                                custom={9}
                              >
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                  <label htmlFor="seller" style={{ marginBottom: 6, fontWeight: 600, color: '#555' }}>
                                    البائع
                                  </label>
                                  <Input 
                                    id="seller" 
                                    value={invoiceData.seller} 
                                    disabled 
                                    style={{ 
                                      background: '#fafafa',
                                      borderRadius: 8
                                    }}
                                  />
                                </div>
                                {invoiceData.reason === "سبب آخر" && (
                                  <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    transition={{ duration: 0.3 }}
                                    style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
                                  >
                                    <label htmlFor="customReason" style={{ marginBottom: 6, fontWeight: 600, color: '#555' }}>
                                      السبب المخصص
                                    </label>
                                    <Input
                                      id="customReason"
                                      placeholder="اكتب السبب هنا"
                                      value={invoiceData.customReason || ''}
                                      onChange={e => setInvoiceData(d => ({ ...d, customReason: e.target.value }))}
                                    />
                                  </motion.div>
                                )}
                              </motion.div>
                            </Col>
                          </Row>
                        </Spin>
                      </Card>
                    </motion.div>
                  </Col>

                  {/* Invoice Totals */}
                  <Col xs={24} md={8}>
                    <motion.div
                      variants={cardVariants}
                      layout
                    >
                      <Card
                        title={
                          <motion.div layout style={{ fontWeight: 'bold', color: '#305496' }}>
                            بيانات الفاتورة
                          </motion.div>
                        }
                        bordered={false}
                        style={{ 
                          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
                          borderRadius: 16,
                          height: '100%',
                          border: '1px solid #f0f0f0'
                        }}
                      >
                        <Spin spinning={loading}>
                          <motion.div layout>
                            {/* طريقة الدفع في الأعلى */}
                            <motion.div
                              key="paymentMethod"
                              variants={itemVariants}
                              custom={-1}
                              layout
                            >
                              <div
                                style={{
                                  display: 'flex',
                                  flexDirection: 'column',
                                  marginBottom: 16,
                                  width: '100%'
                                }}
                              >
                                <label
                                  htmlFor="paymentMethod"
                                  style={{
                                    marginBottom: 6,
                                    fontWeight: 600,
                                    color: '#305496',
                                    fontSize: 15
                                  }}
                                >
                                  طريقة الدفع
                                </label>
                                <Select
                                  id="paymentMethod"
                                  value={paymentMethod}
                                  placeholder="اختر طريقة الدفع"
                                  onChange={setPaymentMethod}
                                  style={{ width: '100%' }}
                                  dropdownStyle={{ borderRadius: 12 }}
                                >
                                  {paymentOptions.length === 0 ? (
                                    <Select.Option value="" disabled>لا توجد طرق دفع متاحة</Select.Option>
                                  ) : (
                                    paymentOptions.map(opt => (
                                      <Select.Option key={opt.id} value={opt.name}>{opt.name}</Select.Option>
                                    ))
                                  )}
                                </Select>
                              </div>
                            </motion.div>
                            {/* باقي الحقول بدون الإجمالي */}
                            {[
                              { id: 'discountPercent', label: 'نسبة الخصم', value: totals.discountPercent.toString() },
                              { id: 'discountValue', label: 'قيمة الخصم', value: totals.discountValue.toFixed(2) },
                              { id: 'taxValue', label: 'قيمة الضريبة المضافة', value: totals.taxValue.toFixed(2) },
                              { id: 'net', label: 'صافي الفاتورة', value: totals.net.toFixed(2) },
                            ].map((field, index) => (
                              <motion.div
                                key={field.id}
                                variants={itemVariants}
                                custom={index}
                                layout
                              >
                                <div 
                                  style={{ 
                                    display: 'flex', 
                                    flexDirection: 'column',
                                    marginBottom: 12,
                                    width: 'calc(50% - 6px)',
                                    float: index % 2 === 0 ? 'left' : 'right'
                                  }}
                                >
                                  <label 
                                    htmlFor={field.id} 
                                    style={{ 
                                      marginBottom: 6, 
                                      fontWeight: 600, 
                                      color: '#555',
                                      fontSize: 14
                                    }}
                                  >
                                    {field.label}
                                  </label>
                                  <Input 
                                    id={field.id} 
                                    value={field.value} 
                                    disabled 
                                    style={{ 
                                      background: '#fafafa',
                                      borderRadius: 8,
                                      border: '1px solid #e0e0e0',
                                      fontWeight: 'bold',
                                      color: '#333',
                                      fontSize: 14
                                    }}
                                  />
                                </div>
                              </motion.div>
                            ))}
                            {/* الإجمالي في الأسفل */}
                            <motion.div
                              key="total"
                              variants={itemVariants}
                              custom={100}
                              layout
                            >
                              <div 
                                style={{ 
                                  display: 'flex', 
                                  flexDirection: 'column',
                                  marginTop: 24,
                                  marginBottom: 8,
                                  width: '100%'
                                }}
                              >
                                <label 
                                  htmlFor="total" 
                                  style={{ 
                                    marginBottom: 6, 
                                    fontWeight: 600, 
                                    color: '#305496',
                                    fontSize: 16
                                  }}
                                >
                                  الإجمالي
                                </label>
                                <Input 
                                  id="total" 
                                  value={totals.total.toFixed(2)} 
                                  disabled 
                                  style={{ 
                                    background: '#fafafa',
                                    borderRadius: 8,
                                    border: '1px solid #e0e0e0',
                                    fontWeight: 'bold',
                                    color: '#305496',
                                    fontSize: 16
                                  }}
                                />
                              </div>
                            </motion.div>
                          </motion.div>
                        </Spin>
                      </Card>
                    </motion.div>
                  </Col>
                </Row>
              </div>
            )}
          </AnimatePresence>
        </motion.div>
      </LayoutGroup>
            {/* Items Table */}
      <AnimatePresence>
        {items.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            style={{ 
              width: '100%', 
              background: '#fff', 
              borderRadius: 16, 
              padding: 20, 
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
              overflowX: 'auto',
              border: '1px solid #f0f0f0'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontWeight: 'bold', fontSize: '1.2rem', color: '#305496' }}>الأصناف</h2>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  type="primary"
                  size="large"
                  style={{
                    background: '#305496',
                    borderColor: '#305496',
                    fontWeight: 'bold',
                    padding: '0 24px',
                    height: 40
                  }}
                  onClick={handleSaveReturn}
                >
                  حفظ المرتجع
                </Button>
              </motion.div>
            </div>
            <Spin spinning={loading}>
              <Table
                columns={columns.map(col => ({
                  ...col,
                  onCell: () => ({
                    variants: tableRowVariants,
                    initial: "hidden",
                    animate: "visible",
                    exit: "hidden"
                  })
                }))}
                dataSource={items.map((item, i) => ({
                  ...item,
                  customRowProps: { custom: i }
                }))}
                rowKey={(r) => r.itemNumber + r.itemName}
                pagination={false}
                scroll={{ x: true }}
                style={{ minWidth: isMobile ? '100%' : 1200 }}
                bordered
                components={{
                  body: {
                    row: ({ children, ...props }: any) => (
                      <motion.tr
                        {...props}
                        variants={tableRowVariants}
                        custom={props['data-row-key']}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        whileHover={{ 
                          backgroundColor: 'rgba(48, 84, 150, 0.03)',
                          transition: { duration: 0.2 }
                        }}
                      >
                        {children}
                      </motion.tr>
                    )
                  }
                }}
              />
            {/* Summary Row Below Table */}
            <div style={{
              marginTop: 24,
              padding: '16px 0',
              borderTop: '1px solid #eee',
              display: 'flex',
              gap: 32,
              flexWrap: 'wrap',
              justifyContent: 'flex-end',
              background: '#fafcff',
              borderRadius: 12
            }}>
              {/* إجمالي قيمة الخصم */}
              <div style={{ minWidth: 180 }}>
                <span style={{ fontWeight: 600, color: '#305496' }}>إجمالي قيمة الخصم:</span>
                <span style={{ marginRight: 8, fontWeight: 'bold', color: '#333' }}>
                  {items.reduce((acc, item) => {
                    const returned = Number(item.returnedQty) || 0;
                    const subtotal = Number(item.price) * returned;
                    const discountValue = subtotal * Number(item.discountPercent) / 100;
                    return acc + discountValue;
                  }, 0).toFixed(2)}
                </span>
              </div>
              {/* إجمالي الصافي بعد الخصم */}
              <div style={{ minWidth: 180 }}>
                <span style={{ fontWeight: 600, color: '#305496' }}>إجمالي الصافي بعد الخصم:</span>
                <span style={{ marginRight: 8, fontWeight: 'bold', color: '#333' }}>
                  {items.reduce((acc, item) => {
                    const returned = Number(item.returnedQty) || 0;
                    const subtotal = Number(item.price) * returned;
                    const discountValue = subtotal * Number(item.discountPercent) / 100;
                    return acc + (subtotal - discountValue);
                  }, 0).toFixed(2)}
                </span>
              </div>
              {/* إجمالي قيمة الضريبة */}
              <div style={{ minWidth: 180 }}>
                <span style={{ fontWeight: 600, color: '#305496' }}>إجمالي قيمة الضريبة:</span>
                <span style={{ marginRight: 8, fontWeight: 'bold', color: '#333' }}>
                  {items.reduce((acc, item) => {
                    const returned = Number(item.returnedQty) || 0;
                    const subtotal = Number(item.price) * returned;
                    const discountValue = subtotal * Number(item.discountPercent) / 100;
                    const taxValue = (subtotal - discountValue) * Number(item.taxPercent) / 100;
                    return acc + taxValue;
                  }, 0).toFixed(2)}
                </span>
              </div>
              {/* إجمالي الصافي المرتجع */}
              <div style={{ minWidth: 180 }}>
                <span style={{ fontWeight: 600, color: '#305496' }}>إجمالي الصافي المرتجع:</span>
                <span style={{ marginRight: 8, fontWeight: 'bold', color: '#333' }}>
                  {items.reduce((acc, item) => {
                    const returned = Number(item.returnedQty) || 0;
                    const subtotal = Number(item.price) * returned;
                    const discountValue = subtotal * Number(item.discountPercent) / 100;
                    const taxValue = (subtotal - discountValue) * Number(item.taxPercent) / 100;
                    return acc + (subtotal - discountValue + taxValue);
                  }, 0).toFixed(2)}
                </span>
              </div>
            </div>
            </Spin>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Button */}
      {items.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          transition={{ delay: 0.3 }}
          style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 100
          }}
        >
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Button 
              type="primary" 
              shape="circle" 
              size="large"
              style={{
                width: 60,
                height: 60,
                boxShadow: '0 4px 12px rgba(48, 84, 150, 0.3)',
                background: '#305496',
                borderColor: '#305496'
              }}
              icon={<PrinterOutlined style={{ fontSize: 24 }} />}
            />
          </motion.div>
        </motion.div>
      )}

      {/* Page Loader */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(255, 255, 255, 0.7)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 1000
            }}
          >
            <motion.div
              animate={{ 
                rotate: 360,
                transition: { 
                  repeat: Infinity, 
                  duration: 1, 
                  ease: "linear" 
                } 
              }}
            >
              <Spin 
                indicator={
                  <div style={{
                    width: 50,
                    height: 50,
                    border: '4px solid #f3f3f3',
                    borderTop: '4px solid #305496',
                    borderRadius: '50%'
                  }} />
                } 
                size="large" 
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SalesReturnPage;