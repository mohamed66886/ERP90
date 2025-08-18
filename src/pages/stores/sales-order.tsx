import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Breadcrumb from '@/components/Breadcrumb';
import { motion } from 'framer-motion';
import { Table, Select, DatePicker, Button, Input, Card, Row, Col, Statistic, Modal, Popconfirm, message } from 'antd';
import { SearchOutlined, DownloadOutlined, EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { TableOutlined, PrinterOutlined, FileTextOutlined } from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import { useFinancialYear } from '@/hooks/useFinancialYear';
import { fetchBranches, Branch } from '@/lib/branches';
import { Helmet } from "react-helmet";
import { GiMagicBroom } from 'react-icons/gi';
import styles from './ReceiptVoucher.module.css';

const { Option } = Select;
const { confirm } = Modal;

interface SalesOrderRecord {
  key: string;
  id: string;
  orderNumber: string;
  orderDate: string;
  customerName: string;
  customerPhone: string;
  warehouse: string;
  amount: number;
  discount: number;
  taxValue: number;
  total: number;
  projectName: string;
  branchName: string;
  deliveryDateFrom: string;
  deliveryDateTo: string;
  createdAt: string;
  createdTime: string;
  contractNumber: string;
  itemName: string;
  itemCode: string;
}

interface Customer {
  id: string;
  name: string;
  phone: string;
}

interface SalesRep {
  id: string;
  name: string;
}

interface PaymentMethod {
  id: string;
  name: string;
}

interface Warehouse {
  id: string;
  name?: string;
  nameAr?: string;
  nameEn?: string;
}

interface Project {
  id: string;
  name: string;
}

interface Item {
  id: string;
  name: string;
  code: string;
}

const SalesOrder: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [salesReps, setSalesReps] = useState<SalesRep[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [branchesLoading, setBranchesLoading] = useState(true);

  // بيانات أوامر البيع والإحصائيات
  const [salesOrders, setSalesOrders] = useState<SalesOrderRecord[]>([]);
  const [filteredSalesOrders, setFilteredSalesOrders] = useState<SalesOrderRecord[]>([]);
  const [totalStats, setTotalStats] = useState({
    totalOrders: 0,
    totalAmount: 0,
    totalDiscount: 0,
    totalTax: 0
  });

  // ستايل موحد لعناصر الإدخال والدروب داون مثل صفحة سند القبض
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
  const [orderNumber, setOrderNumber] = useState<string>('');
  const [selectedBranch, setSelectedBranch] = useState<string>('');
  const [amountFrom, setAmountFrom] = useState<number | null>(null);
  const [amountTo, setAmountTo] = useState<number | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  const [contractNumber, setContractNumber] = useState<string>('');
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [dateFrom, setDateFrom] = useState<Dayjs | null>(null);
  const [dateTo, setDateTo] = useState<Dayjs | null>(null);
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>('');
  const [selectedSalesRep, setSelectedSalesRep] = useState<string>('');
  const [customerNumber, setCustomerNumber] = useState<string>('');
  const [customerName, setCustomerName] = useState<string>('');
  const [deliveryDateFrom, setDeliveryDateFrom] = useState<Dayjs | null>(null);
  const [deliveryDateTo, setDeliveryDateTo] = useState<Dayjs | null>(null);
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [selectedItem, setSelectedItem] = useState<string>('');
  const [searchDebitAccount, setSearchDebitAccount] = useState(false);

  // Modal states for sales rep search
  const [showSalesRepModal, setShowSalesRepModal] = useState(false);
  const [salesRepSearch, setSalesRepSearch] = useState('');
  const [salesRepAccounts, setSalesRepAccounts] = useState<{ id: string; number: string; name: string; mobile?: string }[]>([]);

  // Modal states for customer search
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [customerSearch, setCustomerSearch] = useState('');
  const [customerAccounts, setCustomerAccounts] = useState<{ code: string; nameAr: string; mobile?: string; taxNumber?: string }[]>([]);

  // Modal states for project search
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [projectSearch, setProjectSearch] = useState('');
  const [projectAccounts, setProjectAccounts] = useState<{ id: string; name: string; code?: string }[]>([]);

  // Modal states for item search
  const [showItemModal, setShowItemModal] = useState(false);
  const [itemSearch, setItemSearch] = useState('');
  const [itemAccounts, setItemAccounts] = useState<{ id: string; code: string; nameAr: string; nameEn?: string; unitName?: string; price?: number }[]>([]);
  const [itemLoading, setItemLoading] = useState(false);

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

  // جلب بيانات المندوبين الحقيقية
  useEffect(() => {
    if (showSalesRepModal) {
      const fetchSalesReps = async () => {
        try {
          const { getDocs, collection } = await import('firebase/firestore');
          const { db } = await import('@/lib/firebase');
          const repsSnapshot = await getDocs(collection(db, 'salesRepresentatives'));
          const reps = repsSnapshot.docs.map((doc, idx) => {
            const data = doc.data();
            return {
              id: doc.id,
              number: (idx + 1).toString(),
              name: data.name || '',
              mobile: data.phone || ''
            };
          });
          setSalesRepAccounts(reps);
        } catch (error) {
          setSalesRepAccounts([]);
        }
      };
      fetchSalesReps();
    }
  }, [showSalesRepModal]);

  // جلب بيانات العملاء الحقيقية
  useEffect(() => {
    if (showCustomerModal) {
      const fetchCustomers = async () => {
        try {
          const { getAccounts } = await import('@/lib/accountsService');
          const accounts = await getAccounts();
          const customers = accounts.filter(acc => acc.linkedToPage === 'customers');
          setCustomerAccounts(customers.map(acc => ({
            code: acc.code,
            nameAr: acc.nameAr,
            mobile: acc.customerData?.mobile || acc.customerData?.phone || '',
            taxNumber: acc.customerData?.taxFileNumber || ''
          })));
        } catch (error) {
          setCustomerAccounts([]);
        }
      };
      fetchCustomers();
    }
  }, [showCustomerModal]);

  // جلب بيانات المشاريع الحقيقية
  useEffect(() => {
    if (showProjectModal) {
      const fetchProjects = async () => {
        try {
          const { getDocs, collection } = await import('firebase/firestore');
          const { db } = await import('@/lib/firebase');
          const projectsSnapshot = await getDocs(collection(db, 'projects'));
          const projects = projectsSnapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              name: data.name || '',
              code: data.code || ''
            };
          });
          setProjectAccounts(projects);
        } catch (error) {
          setProjectAccounts([]);
        }
      };
      fetchProjects();
    }
  }, [showProjectModal]);

  // جلب بيانات الأصناف الحقيقية (المستوى الأخير فقط)
  useEffect(() => {
    if (showItemModal) {
      const fetchItems = async () => {
        setItemLoading(true);
        try {
          const { getDocs, collection } = await import('firebase/firestore');
          const { db } = await import('@/lib/firebase');
          
          console.log('جاري جلب الأصناف من inventory_items...');
          const itemsSnapshot = await getDocs(collection(db, 'inventory_items'));
          console.log('عدد الأصناف المسترجعة:', itemsSnapshot.docs.length);
          
          const items = itemsSnapshot.docs.map(doc => {
            const data = doc.data();
            console.log('بيانات الصنف:', data);
            return {
              id: doc.id,
              code: data.itemCode || data.code || '',
              nameAr: data.name || data.nameAr || '',
              nameEn: data.nameEn || '',
              unitName: data.unitName || data.unit || '',
              price: parseFloat(data.salePrice || data.price) || 0,
              type: data.type || '',
              parentId: data.parentId || null
            };
          }).filter(item => {
            // فلترة الأصناف للحصول على المستوى الأخير فقط (الأصناف التي ليس لها أطفال)
            const hasCodeAndName = item.code && item.nameAr;
            const isLeafItem = item.type === 'مستوى ثاني' || item.parentId !== undefined;
            console.log(`الصنف ${item.code} - ${item.nameAr}: hasCodeAndName=${hasCodeAndName}, type=${item.type}, parentId=${item.parentId}`);
            return hasCodeAndName;
          });
          
          console.log('الأصناف المفلترة:', items);
          setItemAccounts(items);
        } catch (error) {
          console.error('خطأ في جلب الأصناف:', error);
          setItemAccounts([]);
        } finally {
          setItemLoading(false);
        }
      };
      fetchItems();
    }
  }, [showItemModal]);

  // جلب البيانات الأساسية
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // جلب الفروع
        const branchesData = await fetchBranches();
        setBranches(branchesData);

        // جلب البيانات من Firebase
        const { getDocs, collection } = await import('firebase/firestore');
        const { db } = await import('@/lib/firebase');
        
        // جلب العملاء
        const customersSnapshot = await getDocs(collection(db, 'customers'));
        const customersData: Customer[] = customersSnapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().nameAr || doc.data().name || '',
          phone: doc.data().phone || doc.data().phoneNumber || doc.data().mobile || ''
        }));
        setCustomers(customersData);

        // جلب المندوبين
        const salesRepsSnapshot = await getDocs(collection(db, 'salesRepresentatives'));
        const salesRepsData: SalesRep[] = salesRepsSnapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name || ''
        }));
        setSalesReps(salesRepsData);

        // جلب طرق الدفع
        const paymentMethodsSnapshot = await getDocs(collection(db, 'paymentMethods'));
        const paymentMethodsData: PaymentMethod[] = paymentMethodsSnapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name || doc.data().value || ''
        }));
        setPaymentMethods(paymentMethodsData);

        // جلب المخازن
        const warehousesSnapshot = await getDocs(collection(db, 'warehouses'));
        const warehousesData: Warehouse[] = warehousesSnapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name || '',
          nameAr: doc.data().nameAr || '',
          nameEn: doc.data().nameEn || ''
        }));
        setWarehouses(warehousesData);

        // جلب المشاريع
        const projectsSnapshot = await getDocs(collection(db, 'projects'));
        const projectsData: Project[] = projectsSnapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name || ''
        }));
        setProjects(projectsData);

        // جلب الأصناف
        const itemsSnapshot = await getDocs(collection(db, 'inventory_items'));
        const itemsData: Item[] = itemsSnapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name || doc.data().nameAr || '',
          code: doc.data().itemCode || doc.data().code || ''
        }));
        setItems(itemsData);

      } catch (error) {
        console.error('خطأ في جلب البيانات الأساسية:', error);
      } finally {
        setBranchesLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  // جلب بيانات أوامر البيع من Firebase
  const fetchSalesOrdersData = useCallback(async () => {
    setIsLoading(true);
    try {
      const { getDocs, collection, query, orderBy } = await import('firebase/firestore');
      const { db } = await import('@/lib/firebase');
      
      let snapshot;
      
      try {
        // إنشاء استعلام بسيط بدون فلاتر معقدة لتجنب مشاكل الفهرسة
        const salesOrdersRef = collection(db, 'salesOrders');
        const salesOrdersQuery = query(salesOrdersRef, orderBy('createdAt', 'desc'));
        snapshot = await getDocs(salesOrdersQuery);
      } catch (indexError) {
        console.warn('فشل في استخدام الترتيب بالتاريخ، جاري استخدام استعلام بسيط:', indexError);
        try {
          // محاولة الترتيب بحقل آخر
          const salesOrdersRef = collection(db, 'salesOrders');
          const salesOrdersQuery = query(salesOrdersRef, orderBy('__name__', 'desc'));
          snapshot = await getDocs(salesOrdersQuery);
        } catch (secondError) {
          console.warn('فشل في استخدام أي ترتيب، جاري استخدام استعلام بدون ترتيب:', secondError);
          // في حالة فشل جميع الاستعلامات مع الترتيب، استخدم استعلام بسيط
          const salesOrdersRef = collection(db, 'salesOrders');
          snapshot = await getDocs(salesOrdersRef);
        }
      }
      
      let salesOrdersData = snapshot.docs.map(doc => {
        const data = doc.data();
        
        // حساب الإجماليات من الأصناف
        let totalAmount = 0;
        let totalDiscount = 0;
        let totalTax = 0;
        let finalTotal = 0;

        if (data.items && Array.isArray(data.items)) {
          data.items.forEach((item: { quantity?: number | string; price?: number | string; discountValue?: number | string; taxValue?: number | string; itemName?: string; itemNumber?: string }) => {
            const quantity = Number(item.quantity) || 0;
            const price = Number(item.price) || 0;
            const discountValue = Number(item.discountValue) || 0;
            const taxValue = Number(item.taxValue) || 0;
            
            const itemTotal = quantity * price;
            totalAmount += itemTotal;
            totalDiscount += discountValue;
            totalTax += taxValue;
            finalTotal += (itemTotal - discountValue + taxValue);
          });
        }

        // الحصول على اسم الفرع
        const branchName = branches.find(b => b.id === data.branch)?.name || '';

        // الحصول على اسم المخزن
        const warehouseName = warehouses.find(w => w.id === data.warehouse)?.nameAr || 
                              warehouses.find(w => w.id === data.warehouse)?.name || 
                              warehouses.find(w => w.id === data.warehouse)?.nameEn ||
                              data.warehouse || '';

        // معلومات الصنف الأول
        let itemName = '';
        let itemCode = '';
        if (data.items && Array.isArray(data.items) && data.items.length > 0) {
          const firstItem = data.items[0];
          itemName = firstItem.itemName || '';
          itemCode = firstItem.itemNumber || '';
        }

        return {
          key: doc.id,
          id: doc.id,
          orderNumber: data.quotationNumber || data.orderNumber || '',
          orderDate: data.date || '',
          customerName: data.customerName || '',
          customerPhone: data.customerNumber || '',
          warehouse: warehouseName,
          amount: totalAmount,
          discount: totalDiscount,
          taxValue: totalTax,
          total: finalTotal,
          projectName: data.projectName || '',
          branchName: branchName,
          deliveryDateFrom: data.validUntil || '',
          deliveryDateTo: data.dueDate || '',
          createdAt: data.createdAt || new Date().toISOString(),
          createdTime: data.createdAt ? dayjs(data.createdAt).format('HH:mm:ss') : '',
          contractNumber: data.contractNumber || '',
          itemName,
          itemCode
        };
      }) as SalesOrderRecord[];

      // تطبيق الفلاتر الإضافية في الكود
      salesOrdersData = salesOrdersData.filter(order => {
        let matches = true;

        // فلتر الفرع - نحتاج للوصول إلى البيانات الأصلية
        if (selectedBranch) {
          // البحث في البيانات الأصلية للمقارنة
          const originalDoc = snapshot.docs.find(doc => doc.id === order.id);
          if (originalDoc && originalDoc.data().branch !== selectedBranch) {
            matches = false;
          }
        }

        // فلتر طريقة الدفع
        if (selectedPaymentMethod) {
          const originalDoc = snapshot.docs.find(doc => doc.id === order.id);
          if (originalDoc && originalDoc.data().paymentMethod !== selectedPaymentMethod) {
            matches = false;
          }
        }

        if (orderNumber && !order.orderNumber.toLowerCase().includes(orderNumber.toLowerCase())) {
          matches = false;
        }

        if (customerName && !order.customerName.toLowerCase().includes(customerName.toLowerCase())) {
          matches = false;
        }

        if (customerNumber && !order.customerPhone.includes(customerNumber)) {
          matches = false;
        }

        if (customerPhone && !order.customerPhone.includes(customerPhone)) {
          matches = false;
        }

        if (contractNumber && !order.contractNumber.toLowerCase().includes(contractNumber.toLowerCase())) {
          matches = false;
        }

        if (selectedProject && !order.projectName.toLowerCase().includes(selectedProject.toLowerCase())) {
          matches = false;
        }

        if (selectedWarehouse) {
          const warehouseName = warehouses.find(w => w.id === selectedWarehouse)?.nameAr || 
                               warehouses.find(w => w.id === selectedWarehouse)?.name || 
                               warehouses.find(w => w.id === selectedWarehouse)?.nameEn || '';
          if (!order.warehouse.includes(warehouseName)) {
            matches = false;
          }
        }

        if (selectedSalesRep) {
          // البحث في اسم المندوب من بيانات المندوبين
          const salesRepName = salesRepAccounts.find(rep => rep.name.toLowerCase().includes(selectedSalesRep.toLowerCase()))?.name || '';
          if (!salesRepName) {
            matches = false;
          }
        }

        if (amountFrom !== null && order.amount < amountFrom) {
          matches = false;
        }

        if (amountTo !== null && order.amount > amountTo) {
          matches = false;
        }

        // فلتر التاريخ
        if (dateFrom) {
          const orderDate = dayjs(order.orderDate);
          if (orderDate.isBefore(dateFrom, 'day')) {
            matches = false;
          }
        }

        if (dateTo) {
          const orderDate = dayjs(order.orderDate);
          if (orderDate.isAfter(dateTo, 'day')) {
            matches = false;
          }
        }

        // فلتر تاريخ التوريد
        if (deliveryDateFrom && order.deliveryDateFrom) {
          const deliveryDate = dayjs(order.deliveryDateFrom);
          if (deliveryDate.isBefore(deliveryDateFrom, 'day')) {
            matches = false;
          }
        }

        if (deliveryDateTo && order.deliveryDateTo) {
          const deliveryDate = dayjs(order.deliveryDateTo);
          if (deliveryDate.isAfter(deliveryDateTo, 'day')) {
            matches = false;
          }
        }

        // فلتر الصنف
        if (selectedItem) {
          const hasItem = order.itemName.toLowerCase().includes(selectedItem.toLowerCase()) ||
                         order.itemCode.toLowerCase().includes(selectedItem.toLowerCase());
          if (!hasItem) {
            matches = false;
          }
        }

        return matches;
      });

      // ترتيب البيانات في الكود إذا لم يتم ترتيبها في قاعدة البيانات
      salesOrdersData.sort((a, b) => {
        const dateA = dayjs(a.createdAt);
        const dateB = dayjs(b.createdAt);
        return dateB.valueOf() - dateA.valueOf(); // ترتيب تنازلي (الأحدث أولاً)
      });

      setSalesOrders(salesOrdersData);
      setFilteredSalesOrders(salesOrdersData);

      // حساب الإحصائيات
      const stats = {
        totalOrders: salesOrdersData.length,
        totalAmount: salesOrdersData.reduce((sum, order) => sum + order.total, 0),
        totalDiscount: salesOrdersData.reduce((sum, order) => sum + order.discount, 0),
        totalTax: salesOrdersData.reduce((sum, order) => sum + order.taxValue, 0)
      };
      setTotalStats(stats);

    } catch (error) {
      console.error('خطأ في جلب أوامر البيع:', error);
      message.error('حدث خطأ أثناء جلب أوامر البيع');
      setFilteredSalesOrders([]);
    } finally {
      setIsLoading(false);
    }
  }, [
    dateFrom, dateTo, selectedBranch, selectedPaymentMethod, selectedWarehouse, 
    selectedSalesRep, selectedProject, orderNumber, amountFrom, amountTo, 
    contractNumber, customerNumber, customerName, customerPhone, selectedItem,
    branches, warehouses, salesRepAccounts, deliveryDateFrom, deliveryDateTo
  ]);

  // جلب البيانات عند تحميل الصفحة
  useEffect(() => {
    if (!branchesLoading) {
      fetchSalesOrdersData();
    }
  }, [fetchSalesOrdersData, branchesLoading]);

  // وظيفة البحث
  const handleSearch = () => {
    fetchSalesOrdersData();
  };

  // وظيفة تصدير Excel
  const handleExport = async () => {
    try {
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

      // تجهيز البيانات للتصدير
      const exportData = filteredSalesOrders.map(order => [
        order.orderNumber,
        order.orderDate,
        order.customerName,
        order.customerPhone,
        order.warehouse,
        order.amount?.toFixed(2),
        order.discount?.toFixed(2),
        order.taxValue?.toFixed(2),
        order.total?.toFixed(2),
        order.projectName,
        order.branchName,
        order.deliveryDateTo || '',
        order.createdAt || '',
        order.createdTime || '',
      ]);

      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet('أوامر البيع');

      // إعداد الأعمدة بنفس تصميم عروض الأسعار
      sheet.columns = [
        { header: 'رقم أمر البيع', key: 'orderNumber', width: 15 },
        { header: 'تاريخ أمر البيع', key: 'orderDate', width: 17 },
        { header: 'العميل', key: 'customerName', width: 20 },
        { header: 'رقم الهاتف', key: 'customerPhone', width: 15 },
        { header: 'المخزن', key: 'warehouse', width: 15 },
        { header: 'قيمة المبلغ', key: 'amount', width: 12 },
        { header: 'الخصم', key: 'discount', width: 10 },
        { header: 'القيمة الضريبية', key: 'taxValue', width: 17 },
        { header: 'الإجمالي', key: 'total', width: 12 },
        { header: 'المشروع', key: 'projectName', width: 20 },
        { header: 'الفرع', key: 'branchName', width: 15 },
        { header: 'تاريخ التوريد ', key: 'deliveryDateTo', width: 15 },
        { header: 'تاريخ الإنشاء', key: 'createdAt', width: 25 },
        { header: 'وقت الإنشاء', key: 'createdTime', width: 14 },

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
      a.download = `اوامر_البيع_${dayjs().format('YYYYMMDD_HHmmss')}.xlsx`;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }, 100);
      message.success('تم تصدير البيانات بنجاح');
    } catch (error) {
      console.error('خطأ في تصدير البيانات:', error);
      message.error('حدث خطأ أثناء تصدير البيانات');
    }
  };

  // أعمدة الجدول
  const columns = [
    {
      title: 'رقم أمر البيع',
      dataIndex: 'orderNumber',
      key: 'orderNumber',
      width: 120,
      sorter: (a: SalesOrderRecord, b: SalesOrderRecord) => a.orderNumber.localeCompare(b.orderNumber),
    },
    {
      title: 'تاريخ أمر البيع',
      dataIndex: 'orderDate',
      key: 'orderDate',
      width: 120,
      sorter: (a: SalesOrderRecord, b: SalesOrderRecord) => dayjs(a.orderDate).valueOf() - dayjs(b.orderDate).valueOf(),
    },
    {
      title: 'العميل',
      dataIndex: 'customerName',
      key: 'customerName',
      width: 150,
      sorter: (a: SalesOrderRecord, b: SalesOrderRecord) => a.customerName.localeCompare(b.customerName),
    },
    {
      title: 'المخزن',
      dataIndex: 'warehouse',
      key: 'warehouse',
      width: 120,
      sorter: (a: SalesOrderRecord, b: SalesOrderRecord) => a.warehouse.localeCompare(b.warehouse),
    },
    {
      title: 'قيمة المبلغ',
      dataIndex: 'amount',
      key: 'amount',
      width: 100,
      render: (amount: number) => `${amount.toLocaleString()} ر.س`,
      sorter: (a: SalesOrderRecord, b: SalesOrderRecord) => a.amount - b.amount,
    },
    {
      title: 'الخصم',
      dataIndex: 'discount',
      key: 'discount',
      width: 80,
      render: (discount: number) => `${discount.toLocaleString()} ر.س`,
      sorter: (a: SalesOrderRecord, b: SalesOrderRecord) => a.discount - b.discount,
    },
    {
      title: 'القيمة الضريبية',
      dataIndex: 'taxValue',
      key: 'taxValue',
      width: 100,
      render: (taxValue: number) => `${taxValue.toLocaleString()} ر.س`,
      sorter: (a: SalesOrderRecord, b: SalesOrderRecord) => a.taxValue - b.taxValue,
    },
    {
      title: 'الإجمالي',
      dataIndex: 'total',
      key: 'total',
      width: 100,
      render: (total: number) => `${total.toLocaleString()} ر.س`,
      sorter: (a: SalesOrderRecord, b: SalesOrderRecord) => a.total - b.total,
    },
    {
      title: 'المشروع',
      dataIndex: 'projectName',
      key: 'projectName',
      width: 150,
      sorter: (a: SalesOrderRecord, b: SalesOrderRecord) => a.projectName.localeCompare(b.projectName),
    },
    {
      title: 'الفرع',
      dataIndex: 'branchName',
      key: 'branchName',
      width: 120,
      sorter: (a: SalesOrderRecord, b: SalesOrderRecord) => a.branchName.localeCompare(b.branchName),
    },
    {
      title: 'تاريخ التوريد',
      key: 'deliveryDate',
      width: 150,
      render: (record: SalesOrderRecord) => (
        <div>
          {record.deliveryDateFrom && (
            <div>من: {record.deliveryDateFrom}</div>
          )}
          {record.deliveryDateTo && (
            <div>إلى: {record.deliveryDateTo}</div>
          )}
        </div>
      ),
    },
    {
      title: 'تاريخ ووقت الإنشاء',
      key: 'createdDateTime',
      width: 150,
      render: (record: SalesOrderRecord) => (
        <div>
          <div>{record.createdAt}</div>
          <div className="text-gray-500 text-xs">{record.createdTime}</div>
        </div>
      ),
      sorter: (a: SalesOrderRecord, b: SalesOrderRecord) => dayjs(a.createdAt).valueOf() - dayjs(b.createdAt).valueOf(),
    },
    {
      title: 'الإجراءات',
      key: 'actions',
      width: 120,
      fixed: 'right' as const,
      render: (record: SalesOrderRecord) => (
        <div className="flex gap-2">
          <Button
            type="text"
            size="small"
            icon={<EditOutlined style={{ color: '#2563eb', fontSize: 20 }} />}
            onClick={() => {
              navigate(`/stores/sales-order/edit/${record.id}`);
            }}
            style={{ padding: 0, minWidth: 32 }}
            aria-label="تعديل"
          />
          <Popconfirm
            title="هل أنت متأكد من حذف هذا الأمر؟"
            onConfirm={() => handleDelete(record.id)}
            okText="نعم"
            cancelText="لا"
          >
            <Button
              type="text"
              size="small"
              icon={<DeleteOutlined style={{ color: '#dc2626', fontSize: 20 }} />}
              style={{ padding: 0, minWidth: 32 }}
              aria-label="حذف"
            />
          </Popconfirm>
        </div>
      ),
    },
  ];

  // وظيفة حذف أمر البيع
  const handleDelete = async (orderId: string) => {
    try {
      const { doc, deleteDoc } = await import('firebase/firestore');
      const { db } = await import('@/lib/firebase');
      
      await deleteDoc(doc(db, 'salesOrders', orderId));
      message.success('تم حذف أمر البيع بنجاح');
      fetchSalesOrdersData();
    } catch (error) {
      console.error('خطأ في حذف أمر البيع:', error);
      message.error('حدث خطأ أثناء حذف أمر البيع');
    }
  };

  return (
    <div className="w-full p-2 sm:p-4 space-y-4 bg-gray-50 min-h-screen" dir="rtl">
      <Helmet>
        <title>أوامر البيع | ERP90 Dashboard</title>
        <meta name="description" content="إدارة أوامر البيع - نظام ERP90" />
        <meta name="keywords" content="أوامر البيع, ERP, إدارة المبيعات, فواتير" />
      </Helmet>

      {/* العنوان الرئيسي */}
      <div className="p-3 sm:p-4 font-['Tajawal'] bg-white mb-4 rounded-lg shadow-[0_0_10px_rgba(0,0,0,0.1)] relative overflow-hidden">
        <div className="flex items-center">
          <FileTextOutlined className="h-5 w-5 sm:h-8 sm:w-8 text-emerald-600 ml-1 sm:ml-3" />
          <h1 className="text-lg sm:text-2xl font-bold text-gray-800">أوامر البيع</h1>
        </div>
        <p className="text-xs sm:text-base text-gray-600 mt-2">إدارة وعرض أوامر البيع</p>
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-green-500"></div>
      </div>

      <Breadcrumb
        items={[
          { label: "الرئيسية", to: "/" },
          { label: "إدارة المبيعات", to: "/management/sales" },
          { label: "أوامر البيع" }
        ]}
      />
     <div className="w-full flex justify-end mb-2">
        <Button
          icon={<PlusOutlined />}
          onClick={() => {
            navigate('/stores/sales-order/new');
            window.scrollTo(0, 0);
          }}
          className="bg-blue-600 hover:bg-blue-700 border-blue-600 hover:border-blue-700 text-white px-7 py-3 text-base font-bold"
        >
          إضافة أمر بيع جديد
        </Button>
      </div>
      {/* نموذج البحث */}
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
            <span style={labelStyle}>رقم أمر البيع</span>
            <Input
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              placeholder="ادخل رقم أمر البيع"
              style={largeControlStyle}
              size="large"
              allowClear
            />
          </div>
          <div className="flex flex-col">
            <span style={labelStyle}>الفرع</span>
            <Select
              value={selectedBranch}
              onChange={setSelectedBranch}
              placeholder="اختر الفرع"
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
              {branches.map(branch => (
                <Option key={branch.id} value={branch.id}>
                  {branch.name}
                </Option>
              ))}
            </Select>
          </div>
          <div className="flex flex-row gap-2 items-end">
            <div className="flex flex-col" style={{ flex: 0.5 }}>
              <span style={labelStyle}>رقم العميل</span>
              <Input
                value={customerNumber}
                onChange={(e) => setCustomerNumber(e.target.value)}
                placeholder="ادخل رقم العميل"
                style={largeControlStyle}
                size="large"
                allowClear
                suffix={
                  <button
                    type="button"
                    style={{
                      borderRadius: 6,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: 32,
                      width: 32,
                      border: 'none',
                      background: 'transparent',
                      padding: 0
                    }}
                    title="بحث عن عميل"
                    onClick={() => setShowCustomerModal(true)}
                  >
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M4 4v6h6V4H4zm10 0v6h6V4h-6zM4 14v6h6v-6H4zm10 0v6h6v-6h-6z" stroke="#6d28d9" strokeWidth="2"/>
                    </svg>
                  </button>
                }
              />
            </div>
            <div className="flex flex-col" style={{ flex: 1 }}>
              <span style={labelStyle}>اسم العميل</span>
              <Input
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="ادخل اسم العميل"
                style={largeControlStyle}
                size="large"
                allowClear
                suffix={
                  <button
                    type="button"
                    style={{
                      borderRadius: 6,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: 32,
                      width: 32,
                      border: 'none',
                      background: 'transparent',
                      padding: 0
                    }}
                    title="بحث عن عميل"
                    onClick={() => setShowCustomerModal(true)}
                  >
                    <GiMagicBroom size={26} color="#8e44ad" />
                  </button>
                }
              />
            </div>
          </div>
          <div className="flex flex-col">
            <span style={labelStyle}>قيمة المبلغ </span>
            <Input
              type="number"
              value={amountFrom}
              onChange={(e) => setAmountFrom(e.target.value ? parseFloat(e.target.value) : null)}
              placeholder="المبلغ "
              style={largeControlStyle}
              size="large"
              allowClear
            />
          </div>
          <div className="flex flex-col">
            <span style={labelStyle}>طريقة الدفع</span>
            <Select
              value={selectedPaymentMethod}
              onChange={setSelectedPaymentMethod}
              placeholder="اختر طريقة الدفع"
              style={{ width: '100%', ...largeControlStyle }}
              size="large"
             className={styles.noAntBorder}
                optionFilterProp="label"
              allowClear
            >
              {paymentMethods.map(method => (
                <Option key={method.id} value={method.id}>
                  {method.name}
                </Option>
              ))}
            </Select>
          </div>
          <div className="flex flex-row gap-2 items-end">
            <div className="flex flex-col" style={{ flex: 0.5 }}>
              <span style={labelStyle}>رقم العقد</span>
              <Input
                value={contractNumber}
                onChange={(e) => setContractNumber(e.target.value)}
                placeholder="ادخل رقم العقد"
                style={largeControlStyle}
                size="large"
                allowClear
                suffix={
                  <button
                    type="button"
                    style={{
                      borderRadius: 6,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: 32,
                      width: 32,
                      border: 'none',
                      background: 'transparent',
                      padding: 0
                    }}
                    title="بحث عن مشروع"
                    onClick={() => setShowProjectModal(true)}
                  >
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M4 4v6h6V4H4zm10 0v6h6V4h-6zM4 14v6h6v-6H4zm10 0v6h6v-6h-6z" stroke="#8e44ad" strokeWidth="2"/>
                    </svg>
                  </button>
                }
              />
            </div>
            <div className="flex flex-col" style={{ flex: 1 }}>
              <span style={labelStyle}>اسم المشروع</span>
              <Input
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                placeholder="ادخل اسم المشروع"
                style={largeControlStyle}
                size="large"
                allowClear
                suffix={
                  <button
                    type="button"
                    style={{
                      borderRadius: 6,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: 32,
                      width: 32,
                      border: 'none',
                      background: 'transparent',
                      padding: 0
                    }}
                    title="بحث عن مشروع"
                    onClick={() => setShowProjectModal(true)}
                  >
                    <GiMagicBroom size={26} color="#8e44ad" />
                  </button>
                }
              />
            </div>
          </div>
          <div className="flex flex-col">
            <span style={labelStyle}>من تاريخ</span>
            <DatePicker
              value={dateFrom}
              onChange={setDateFrom}
              placeholder="اختر التاريخ"
              style={largeControlStyle}
              size="large"
              format="YYYY-MM-DD"
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
            />
          </div>
          <div className="flex flex-col">
            <span style={labelStyle}>المخزن</span>
            <Select
             showSearch

              value={selectedWarehouse}
              onChange={setSelectedWarehouse}
              placeholder="اختر المخزن"
                style={{ width: '100%', ...largeControlStyle }}
              size="large"
             className={styles.noAntBorder}
                optionFilterProp="label"
              allowClear
            >
              {warehouses.map(warehouse => (
                <Option key={warehouse.id} value={warehouse.id}>
                  {warehouse.nameAr || warehouse.name || warehouse.nameEn || warehouse.id}
                </Option>
              ))}
            </Select>
          </div>
          <div className="flex flex-col">
            <span style={labelStyle}>المندوب</span>
            <Input
              value={selectedSalesRep}
              onChange={e => setSelectedSalesRep(e.target.value)}
              placeholder="ادخل اسم المندوب"
              style={largeControlStyle}
              size="large"
              allowClear
              suffix={
                <button
                  type="button"
                  style={{
                    borderRadius: 6,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: 32,
                    width: 32,
                    border: 'none',
                    background: 'transparent',
                    padding: 0
                  }}
                  title="بحث عن مندوب"
                  onClick={() => setShowSalesRepModal(true)}
                >
                  <GiMagicBroom size={26} color="#8e44ad" />
                </button>
              }
            />
          </div>
          <div className="flex flex-col">
            <span style={labelStyle}>تاريخ التوريد من</span>
            <DatePicker
              value={deliveryDateFrom}
              onChange={setDeliveryDateFrom}
              placeholder="اختر التاريخ"
              style={largeControlStyle}
              size="large"
              format="YYYY-MM-DD"
            />
          </div>
          <div className="flex flex-col">
            <span style={labelStyle}>تاريخ التوريد إلى</span>
            <DatePicker
              value={deliveryDateTo}
              onChange={setDeliveryDateTo}
              placeholder="اختر التاريخ"
              style={largeControlStyle}
              size="large"
              format="YYYY-MM-DD"
            />
          </div>
          <div className="flex flex-col">
            <span style={labelStyle}>رقم الهاتف</span>
            <Input
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="ادخل رقم الهاتف"
              style={largeControlStyle}
              size="large"
              allowClear
            />
          </div>
          <div className="flex flex-col">
            <span style={labelStyle}>كود واسم الصنف</span>
            <Input
              value={selectedItem}
              onChange={(e) => setSelectedItem(e.target.value)}
              placeholder="ادخل كود أو اسم الصنف"
              style={largeControlStyle}
              size="large"
              allowClear
              suffix={
                <button
                  type="button"
                  style={{
                    borderRadius: 6,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: 32,
                    width: 32,
                    border: 'none',
                    background: 'transparent',
                    padding: 0
                  }}
                  title="بحث عن صنف"
                  onClick={() => setShowItemModal(true)}
                >
                  <GiMagicBroom size={26} color="#8e44ad" />
                </button>
              }
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
      </motion.div>

      {/* نتائج البحث */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="w-full bg-white p-2 sm:p-4 rounded-lg border border-emerald-100 flex flex-col gap-4 shadow-sm overflow-x-auto relative"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-green-500"></div>
        
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
            <TableOutlined className="text-emerald-600 text-lg" /> نتائج البحث
            {isLoading && (
              <span className="text-sm text-orange-600 bg-orange-50 px-2 py-1 rounded animate-pulse">
                جاري البحث...
              </span>
            )}
          </h3>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            إجمالي: {filteredSalesOrders.length} أمر بيع
            {filteredSalesOrders.length > 0 && (
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
                  icon={<PrinterOutlined style={{ fontSize: 18, color: '#059669' }} />}
                  onClick={() => window.print()}
                  className="bg-emerald-100 hover:bg-emerald-200 border-emerald-200 text-emerald-700 ml-2 px-5 py-2 text-base font-bold"
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
            dataSource={filteredSalesOrders}
            loading={isLoading}
            size="small"
            scroll={{ x: 1800 }}
            pagination={{
              total: filteredSalesOrders.length,
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} من ${total} أمر بيع`,
            }}
            locale={{
              emptyText: 'لا توجد أوامر بيع في الفترة المحددة',
              filterConfirm: 'موافق',
              filterReset: 'إعادة تعيين',
              selectAll: 'تحديد الكل',
              selectInvert: 'عكس التحديد',
            }}
          />
        </div>
      </motion.div>

      {/* مودال بحث مندوب */}
      <Modal
        open={showSalesRepModal}
        onCancel={() => setShowSalesRepModal(false)}
        footer={null}
        title="بحث عن مندوب"
        width={600}
      >
        <Input
          placeholder="بحث بالاسم أو رقم المندوب..."
          value={salesRepSearch}
          onChange={e => setSalesRepSearch(e.target.value)}
          style={{ marginBottom: 12, fontSize: 17, borderRadius: 8, padding: '8px 12px' }}
          allowClear
        />
        <Table
          dataSource={salesRepAccounts.filter(acc =>
            acc.number.includes(salesRepSearch) || acc.name.includes(salesRepSearch) || (acc.mobile && acc.mobile.includes(salesRepSearch))
          )}
          columns={[
            { title: 'رقم المندوب', dataIndex: 'number', key: 'number', width: 140 },
            { title: 'اسم المندوب', dataIndex: 'name', key: 'name' },
            { title: 'جوال المندوب', dataIndex: 'mobile', key: 'mobile', width: 140, render: (text) => text || '-' }
          ]}
          rowKey="id"
          pagination={{ pageSize: 8 }}
          size="small"
          bordered
          onRow={record => ({
            onClick: () => {
              setSelectedSalesRep(record.name);
              setShowSalesRepModal(false);
            },
            style: { cursor: 'pointer' }
          })}
        />
      </Modal>

      {/* مودال بحث عميل */}
      <Modal
        open={showCustomerModal}
        onCancel={() => setShowCustomerModal(false)}
        footer={null}
        title="بحث عن عميل"
        width={600}
      >
        <Input
          placeholder="بحث بالاسم أو رقم الحساب..."
          value={customerSearch}
          onChange={e => setCustomerSearch(e.target.value)}
          style={{ marginBottom: 12, fontSize: 17, borderRadius: 8, padding: '8px 12px' }}
          allowClear
        />
        <Table
          dataSource={customerAccounts.filter(acc =>
            acc.code.includes(customerSearch) || acc.nameAr.includes(customerSearch) || (acc.mobile && acc.mobile.includes(customerSearch))
          )}
          columns={[
            { title: 'رقم الحساب', dataIndex: 'code', key: 'code', width: 120 },
            { title: 'اسم الحساب', dataIndex: 'nameAr', key: 'nameAr' },
            { title: 'جوال العميل', dataIndex: 'mobile', key: 'mobile', width: 140, render: (text) => text || '-' },
            { title: 'الرقم الضريبي', dataIndex: 'taxNumber', key: 'taxNumber', width: 160, render: (text) => text || '-' }
          ]}
          rowKey="code"
          pagination={{ pageSize: 8 }}
          size="small"
          bordered
          onRow={record => ({
            onClick: () => {
              setCustomerName(record.nameAr);
              setCustomerNumber(record.code);
              setShowCustomerModal(false);
            },
            style: { cursor: 'pointer' }
          })}
        />
      </Modal>

      {/* مودال بحث مشروع */}
      <Modal
        open={showProjectModal}
        onCancel={() => setShowProjectModal(false)}
        footer={null}
        title="بحث عن مشروع"
        width={600}
      >
        <Input
          placeholder="بحث بالاسم أو كود المشروع..."
          value={projectSearch}
          onChange={e => setProjectSearch(e.target.value)}
          style={{ marginBottom: 12, fontSize: 17, borderRadius: 8, padding: '8px 12px' }}
          allowClear
        />
        <Table
          dataSource={projectAccounts.filter(acc =>
            acc.name.includes(projectSearch) || (acc.code && acc.code.includes(projectSearch))
          )}
          columns={[
            { title: 'كود المشروع', dataIndex: 'code', key: 'code', width: 140, render: (text) => text || '-' },
            { title: 'اسم المشروع', dataIndex: 'name', key: 'name' }
          ]}
          rowKey="id"
          pagination={{ pageSize: 8 }}
          size="small"
          bordered
          onRow={record => ({
            onClick: () => {
              setSelectedProject(record.name);
              setShowProjectModal(false);
            },
            style: { cursor: 'pointer' }
          })}
        />
      </Modal>

      {/* مودال بحث صنف */}
      <Modal
        open={showItemModal}
        onCancel={() => setShowItemModal(false)}
        footer={null}
        title="بحث عن صنف"
        width={800}
      >
        <Input
          placeholder="بحث بالكود أو الاسم العربي أو الإنجليزي..."
          value={itemSearch}
          onChange={e => setItemSearch(e.target.value)}
          style={{ marginBottom: 12, fontSize: 17, borderRadius: 8, padding: '8px 12px' }}
          allowClear
        />
        
        {itemLoading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div>جاري تحميل الأصناف...</div>
          </div>
        ) : (
          <Table
            dataSource={itemAccounts.filter(acc =>
              acc.code.toLowerCase().includes(itemSearch.toLowerCase()) || 
              acc.nameAr.toLowerCase().includes(itemSearch.toLowerCase()) ||
              (acc.nameEn && acc.nameEn.toLowerCase().includes(itemSearch.toLowerCase()))
            )}
            columns={[
              { title: 'كود الصنف', dataIndex: 'code', key: 'code', width: 120 },
              { title: 'الاسم العربي', dataIndex: 'nameAr', key: 'nameAr', width: 200 },
              { title: 'الاسم الإنجليزي', dataIndex: 'nameEn', key: 'nameEn', width: 180, render: (text) => text || '-' },
              { title: 'الوحدة', dataIndex: 'unitName', key: 'unitName', width: 100, render: (text) => text || '-' },
              { title: 'السعر', dataIndex: 'price', key: 'price', width: 100, render: (price) => price ? `${price.toLocaleString()} ر.س` : '-' }
            ]}
            rowKey="id"
            pagination={{ pageSize: 8 }}
            size="small"
            bordered
            onRow={record => ({
              onClick: () => {
                setSelectedItem(`${record.code} - ${record.nameAr}`);
                setShowItemModal(false);
              },
              style: { cursor: 'pointer' }
            })}
            scroll={{ x: 700 }}
            locale={{
              emptyText: itemAccounts.length === 0 ? 'لا توجد أصناف متاحة في قاعدة البيانات' : 'لا توجد أصناف تطابق البحث'
            }}
          />
        )}
      </Modal>
    </div>
  );
};

export default SalesOrder;
