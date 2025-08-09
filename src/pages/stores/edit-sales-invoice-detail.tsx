import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Form, 
  Input, 
  Button, 
  Select, 
  DatePicker, 
  Table, 
  Card, 
  Row, 
  Col, 
  message, 
  Space,
  InputNumber,
  Typography,
  Divider,
  Spin,
  Modal
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { 
  SaveOutlined, 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined,
  ArrowRightOutlined 
} from '@ant-design/icons';
import { doc, getDoc, updateDoc, collection, getDocs, query, where, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/useAuth';
import { useFinancialYear } from '@/hooks/useFinancialYear';
import { fetchCashBoxes } from '@/services/cashBoxesService';
import Breadcrumb from '@/components/Breadcrumb';
import dayjs from 'dayjs';
import 'dayjs/locale/ar';

const { Title } = Typography;
const { Option } = Select;

dayjs.locale('ar');

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
  cashBox: string;
  branch: string;
  warehouse: string;
  customerNumber: string;
  customerName: string;
  delegate: string;
  priceRule: string;
  commercialRecord: string;
  taxFile: string;
  dueDate?: string;
  items: InvoiceItem[];
  totals: {
    afterDiscount: number;
    afterTax: number;
    total: number;
    tax: number;
  };
}

interface Branch {
  id: string;
  name?: string;
  nameAr?: string;
}

interface Warehouse {
  id: string;
  name?: string;
  nameAr?: string;
}

interface Customer {
  id: string;
  nameAr?: string;
  name?: string;
  phone?: string;
  phoneNumber?: string;
  commercialReg?: string;
  taxFile?: string;
}

interface Delegate {
  id: string;
  name?: string;
  email?: string;
  status?: string;
}

interface CashBox {
  id?: string;
  nameAr: string;
  branch?: string;
}

interface InventoryItem {
  id: string;
  name: string;
  itemCode?: string;
  salePrice?: number;
  unit?: string;
  type?: string;
  tempCodes?: boolean;
  allowNegative?: boolean;
  isVatIncluded?: boolean;
  discount?: number;
}

interface Supplier {
  id: string;
  name: string;
}

const EditSalesInvoiceDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { validateDate, currentFinancialYear } = useFinancialYear();
  
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null);
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);
  
  // البيانات المرجعية
  const [branches, setBranches] = useState<Branch[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [delegates, setDelegates] = useState<Delegate[]>([]);
  const [cashBoxes, setCashBoxes] = useState<CashBox[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [paymentMethods] = useState(['نقدي', 'آجل', 'بطاقة ائتمان', 'شيك', 'تحويل بنكي']);
  const [priceRules] = useState(['السعر العادي', 'سعر الجملة', 'سعر التخفيض']);
  const [units] = useState(['قطعة', 'كرتونة', 'كيلو', 'جرام', 'لتر', 'متر', 'علبة']);

  // صنف جديد
  const [item, setItem] = useState<InvoiceItem>({
    itemNumber: '',
    itemName: '',
    quantity: '1',
    unit: 'قطعة',
    price: '0',
    discountPercent: '0',
    discountValue: 0,
    taxPercent: '15',
    taxValue: 0,
    total: 0,
    isNewItem: false
  });

  const initialItem: InvoiceItem = {
    itemNumber: '',
    itemName: '',
    quantity: '1',
    unit: 'قطعة',
    price: '0',
    discountPercent: '0',
    discountValue: 0,
    taxPercent: '15',
    taxValue: 0,
    total: 0,
    isNewItem: false
  };

  // نموذج إضافة صنف جديد
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
    type: 'مستوى ثاني',
    parentId: ''
  });

  const [addItemLoading, setAddItemLoading] = useState(false);
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [allItems, setAllItems] = useState<InventoryItem[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  // جلب بيانات الفاتورة
  const fetchInvoiceData = useCallback(async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      const invoiceDoc = await getDoc(doc(db, 'sales_invoices', id));
      if (invoiceDoc.exists()) {
        const data = invoiceDoc.data() as InvoiceData;
        setInvoiceData(data);
        setItems(data.items || []);
        
        // تعبئة النموذج
        form.setFieldsValue({
          invoiceNumber: data.invoiceNumber,
          entryNumber: data.entryNumber,
          date: data.date ? dayjs(data.date) : null,
          dueDate: data.dueDate ? dayjs(data.dueDate) : null,
          paymentMethod: data.paymentMethod,
          branch: data.branch,
          warehouse: data.warehouse,
          customerNumber: data.customerNumber,
          customerName: data.customerName,
          delegate: data.delegate,
          priceRule: data.priceRule,
          commercialRecord: data.commercialRecord,
          taxFile: data.taxFile
        });
      } else {
        message.error('لم يتم العثور على الفاتورة');
        navigate('/stores/edit-sales-invoice');
      }
    } catch (error) {
      console.error('Error fetching invoice:', error);
      message.error('حدث خطأ في جلب بيانات الفاتورة');
    } finally {
      setLoading(false);
    }
  }, [id, form, navigate]);

  const fetchReferenceData = useCallback(async () => {
    try {
      // جلب الفروع
      const branchesSnap = await getDocs(collection(db, 'branches'));
      setBranches(branchesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      // جلب المخازن
      const warehousesSnap = await getDocs(collection(db, 'warehouses'));
      setWarehouses(warehousesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      // جلب العملاء
      const customersSnap = await getDocs(collection(db, 'customers'));
      setCustomers(customersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      // جلب المندوبين النشطين
      const delegatesQuery = query(
        collection(db, 'salesRepresentatives'),
        where('status', '==', 'active')
      );
      const delegatesSnap = await getDocs(delegatesQuery);
      setDelegates(delegatesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      // جلب الصناديق النقدية
      const cashBoxesData = await fetchCashBoxes();
      setCashBoxes(cashBoxesData);

      // جلب الأصناف
      const itemsSnap = await getDocs(collection(db, 'inventory_items'));
      const allItemsData = itemsSnap.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name || '',
          itemCode: data.itemCode || '',
          salePrice: data.salePrice || 0,
          unit: data.unit || 'قطعة',
          type: data.type || '',
          tempCodes: data.tempCodes || false,
          allowNegative: data.allowNegative || false,
          isVatIncluded: data.isVatIncluded || false,
          discount: data.discount || 0
        };
      }).filter(item => item.name);
      setInventoryItems(allItemsData);
      setAllItems(allItemsData);

      // جلب الموردين
      const suppliersSnap = await getDocs(collection(db, 'suppliers'));
      setSuppliers(suppliersSnap.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name || data.nameAr || ''
        };
      }));
    } catch (error) {
      console.error('Error fetching reference data:', error);
    }
  }, []);

  useEffect(() => {
    if (id) {
      fetchInvoiceData();
    }
    fetchReferenceData();
  }, [id, fetchInvoiceData, fetchReferenceData]);

  // حساب المجاميع
  const calculateTotals = useCallback((itemsList: InvoiceItem[]) => {
    let totalAfterDiscount = 0;
    let totalTax = 0;
    let grandTotal = 0;

    itemsList.forEach(item => {
      const quantity = Number(item.quantity) || 0;
      const price = Number(item.price) || 0;
      const discountPercent = Number(item.discountPercent) || 0;
      const taxPercent = Number(item.taxPercent) || 0;

      const subtotal = quantity * price;
      const discountValue = subtotal * (discountPercent / 100);
      const netAfterDiscount = subtotal - discountValue;
      const taxValue = netAfterDiscount * (taxPercent / 100);
      const itemTotal = netAfterDiscount + taxValue;

      totalAfterDiscount += netAfterDiscount;
      totalTax += taxValue;
      grandTotal += itemTotal;
    });

    return {
      afterDiscount: totalAfterDiscount,
      afterTax: totalAfterDiscount + totalTax,
      total: grandTotal,
      tax: totalTax
    };
  }, []);

  // إضافة صنف جديد للفاتورة
  const handleAddItem = () => {
    if (!item.itemName || !item.quantity || !item.price) {
      message.error('يرجى تعبئة جميع الحقول المطلوبة');
      return;
    }

    const quantity = Number(item.quantity);
    const price = Number(item.price);
    const discountPercent = Number(item.discountPercent);
    const taxPercent = Number(item.taxPercent);

    const subtotal = quantity * price;
    const discountValue = subtotal * (discountPercent / 100);
    const netAfterDiscount = subtotal - discountValue;
    const taxValue = netAfterDiscount * (taxPercent / 100);
    const total = netAfterDiscount + taxValue;

    const itemToAdd: InvoiceItem = {
      ...item,
      discountValue,
      taxValue,
      total
    };

    if (editingItemIndex !== null) {
      // تعديل صنف موجود
      const updatedItems = [...items];
      updatedItems[editingItemIndex] = itemToAdd;
      setItems(updatedItems);
      setEditingItemIndex(null);
    } else {
      // إضافة صنف جديد
      setItems([...items, itemToAdd]);
    }

    // إعادة تعيين النموذج
    handleClearItem();
  };

  // تعديل صنف في الفاتورة
  const handleEditItem = (itemToEdit: InvoiceItem, index: number) => {
    setItem(itemToEdit);
    setEditingItemIndex(index);
  };

  // حذف صنف من الفاتورة
  const handleDeleteItem = (index: number) => {
    const updatedItems = items.filter((_, i) => i !== index);
    setItems(updatedItems);
  };

  // إضافة صنف جديد للمخزون
  const handleAddNewItem = async () => {
    if (!addItemForm.name.trim() || !addItemForm.salePrice.trim() || !addItemForm.unit.trim()) {
      message.error('يرجى تعبئة جميع الحقول المطلوبة');
      return;
    }

    setAddItemLoading(true);
    try {
      const newInventoryItem = {
        name: addItemForm.name.trim(),
        itemCode: addItemForm.itemCode?.trim() || '',
        salePrice: addItemForm.salePrice ? Number(addItemForm.salePrice) : 0,
        discount: addItemForm.discount ? Number(addItemForm.discount) : 0,
        isVatIncluded: !!addItemForm.isVatIncluded,
        tempCodes: !!addItemForm.tempCodes,
        allowNegative: !!addItemForm.allowNegative,
        type: 'مستوى ثاني',
        parentId: addItemForm.parentId || '',
        unit: addItemForm.unit,
        supplier: addItemForm.supplier || '',
        purchasePrice: addItemForm.purchasePrice ? Number(addItemForm.purchasePrice) : 0,
        minOrder: addItemForm.minOrder ? Number(addItemForm.minOrder) : 0,
        createdAt: new Date().toISOString(),
        createdBy: user?.uid || ''
      };

      const docRef = await addDoc(collection(db, 'inventory_items'), newInventoryItem);
      
      // إضافة الصنف الجديد للقائمة المحلية
      const newItem = { id: docRef.id, ...newInventoryItem };
      setInventoryItems(prev => [...prev, newItem]);
      setAllItems(prev => [...prev, newItem]);

      // إعادة تعيين النموذج
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
        type: 'مستوى ثاني',
        parentId: ''
      });

      setShowAddItemModal(false);
      message.success('تم إضافة الصنف الجديد بنجاح');
    } catch (error) {
      console.error('Error adding item:', error);
      message.error('حدث خطأ في إضافة الصنف');
    } finally {
      setAddItemLoading(false);
    }
  };

  // اختيار صنف من المخزون
  const handleSelectInventoryItem = (itemId: string) => {
    const inventoryItem = inventoryItems.find(inv => inv.id === itemId);
    if (inventoryItem) {
      setItem({
        ...item,
        itemName: inventoryItem.name,
        itemNumber: inventoryItem.itemCode || '',
        price: String(inventoryItem.salePrice || 0),
        unit: inventoryItem.unit || 'قطعة'
      });
    }
  };

  // تعديل قيم الصنف
  const handleItemChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setItem({ ...item, [name]: value });
  };

  // مسح حقول الصنف عند إلغاء التحديد
  const handleClearItem = () => {
    setItem({
      itemNumber: '',
      itemName: '',
      quantity: '1',
      unit: 'قطعة',
      price: '0',
      discountPercent: '0',
      discountValue: 0,
      taxPercent: '15',
      taxValue: 0,
      total: 0
    });
  };

  // اختيار عميل
  const handleSelectCustomer = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    if (customer) {
      form.setFieldsValue({
        customerName: customer.nameAr || customer.name,
        customerNumber: customer.phone || customer.phoneNumber,
        commercialRecord: customer.commercialReg,
        taxFile: customer.taxFile
      });
    }
  };

  // حفظ التعديلات
  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);

      const totals = calculateTotals(items);
      
      const updatedInvoiceData = {
        ...values,
        date: values.date ? values.date.format('YYYY-MM-DD') : '',
        dueDate: values.dueDate ? values.dueDate.format('YYYY-MM-DD') : '',
        items,
        totals,
        updatedAt: new Date().toISOString(),
        updatedBy: user?.uid || ''
      };

      await updateDoc(doc(db, 'sales_invoices', id!), updatedInvoiceData);
      
      message.success('تم حفظ التعديلات بنجاح');
      navigate('/stores/edit-sales-invoice');
    } catch (error) {
      console.error('Error saving invoice:', error);
      message.error('حدث خطأ في حفظ التعديلات');
    } finally {
      setSaving(false);
    }
  };

  // تعريف أعمدة الجدول
  const columns: ColumnsType<InvoiceItem> = [
    {
      title: 'كود الصنف',
      dataIndex: 'itemNumber',
      key: 'itemNumber',
      width: 120,
      align: 'center'
    },
    {
      title: 'اسم الصنف',
      dataIndex: 'itemName',
      key: 'itemName',
      width: 200
    },
    {
      title: 'الكمية',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 100,
      align: 'center'
    },
    {
      title: 'الوحدة',
      dataIndex: 'unit',
      key: 'unit',
      width: 80,
      align: 'center'
    },
    {
      title: 'السعر',
      dataIndex: 'price',
      key: 'price',
      width: 100,
      align: 'center',
      render: (price) => Number(price).toFixed(2)
    },
    {
      title: '% الخصم',
      dataIndex: 'discountPercent',
      key: 'discountPercent',
      width: 80,
      align: 'center'
    },
    {
      title: 'قيمة الخصم',
      dataIndex: 'discountValue',
      key: 'discountValue',
      width: 100,
      align: 'center',
      render: (value) => Number(value).toFixed(2)
    },
    {
      title: '% الضريبة',
      dataIndex: 'taxPercent',
      key: 'taxPercent',
      width: 80,
      align: 'center'
    },
    {
      title: 'قيمة الضريبة',
      dataIndex: 'taxValue',
      key: 'taxValue',
      width: 100,
      align: 'center',
      render: (value) => Number(value).toFixed(2)
    },
    {
      title: 'الإجمالي',
      dataIndex: 'total',
      key: 'total',
      width: 120,
      align: 'center',
      render: (value) => (
        <span style={{ fontWeight: 'bold', color: '#1890ff' }}>
          {Number(value).toFixed(2)}
        </span>
      )
    },
    {
      title: 'الإجراءات',
      key: 'actions',
      width: 120,
      align: 'center',
      render: (_, record, index) => (
        <Space>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEditItem(record, index)}
          />
          <Button
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteItem(index)}
          />
        </Space>
      )
    }
  ];

  const totals = calculateTotals(items);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', direction: 'rtl' }}>
      {/* Header */}
      <Card style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Title level={2} style={{ margin: 0 }}>
              تعديل فاتورة مبيعات - {invoiceData?.invoiceNumber}
            </Title>
            <p style={{ color: '#666', margin: '8px 0 0 0' }}>
              تعديل بيانات وأصناف الفاتورة
            </p>
          </div>
          <Button
            icon={<ArrowRightOutlined />}
            onClick={() => navigate('/stores/edit-sales-invoice')}
          >
            العودة للقائمة
          </Button>
        </div>
      </Card>

      <Breadcrumb
        items={[
          { label: 'الرئيسية', to: '/' },
          { label: 'إدارة المبيعات', to: '/management/sales' },
          { label: 'تعديل فواتير المبيعات', to: '/stores/edit-sales-invoice' },
          { label: `فاتورة ${invoiceData?.invoiceNumber}` }
        ]}
      />

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSave}
      >
        {/* بيانات الفاتورة الأساسية */}
        <Card title="بيانات الفاتورة" style={{ marginBottom: '24px' }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Form.Item
                label="رقم الفاتورة"
                name="invoiceNumber"
                rules={[{ required: true, message: 'رقم الفاتورة مطلوب' }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Form.Item
                label="رقم القيد"
                name="entryNumber"
              >
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Form.Item
                label="تاريخ الفاتورة"
                name="date"
                rules={[{ required: true, message: 'تاريخ الفاتورة مطلوب' }]}
              >
                <DatePicker
                  style={{ width: '100%' }}
                  format="YYYY-MM-DD"
                  placeholder="اختر التاريخ"
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Form.Item
                label="تاريخ الاستحقاق"
                name="dueDate"
              >
                <DatePicker
                  style={{ width: '100%' }}
                  format="YYYY-MM-DD"
                  placeholder="اختر تاريخ الاستحقاق"
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Form.Item
                label="الفرع"
                name="branch"
                rules={[{ required: true, message: 'الفرع مطلوب' }]}
              >
                <Select placeholder="اختر الفرع">
                  {branches.map(branch => (
                    <Option key={branch.id} value={branch.id}>
                      {branch.name || branch.nameAr}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Form.Item
                label="المخزن"
                name="warehouse"
                rules={[{ required: true, message: 'المخزن مطلوب' }]}
              >
                <Select placeholder="اختر المخزن">
                  {warehouses.map(warehouse => (
                    <Option key={warehouse.id} value={warehouse.id}>
                      {warehouse.name || warehouse.nameAr}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Form.Item
                label="المندوب"
                name="delegate"
              >
                <Select placeholder="اختر المندوب">
                  {delegates.map(delegate => (
                    <Option key={delegate.id} value={delegate.id}>
                      {delegate.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* بيانات العميل */}
        <Card title="بيانات العميل" style={{ marginBottom: '24px' }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={8}>
              <Form.Item label="اختيار عميل">
                <Select
                  placeholder="اختر عميل من القائمة"
                  onChange={handleSelectCustomer}
                  showSearch
                  filterOption={(input, option) =>
                    (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
                  }
                >
                  {customers.map(customer => (
                    <Option key={customer.id} value={customer.id}>
                      {customer.nameAr || customer.name} - {customer.phone || customer.phoneNumber}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Form.Item
                label="اسم العميل"
                name="customerName"
                rules={[{ required: true, message: 'اسم العميل مطلوب' }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Form.Item
                label="رقم الهاتف"
                name="customerNumber"
              >
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Form.Item
                label="السجل التجاري"
                name="commercialRecord"
              >
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Form.Item
                label="الرقم الضريبي"
                name="taxFile"
              >
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Form.Item
                label="قائمة الأسعار"
                name="priceRule"
              >
                <Select placeholder="اختر قائمة الأسعار">
                  {priceRules.map(rule => (
                    <Option key={rule} value={rule}>{rule}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* أصناف الفاتورة */}
        <Card 
          title="أصناف الفاتورة" 
          style={{ marginBottom: '24px' }}
        >
          {/* نموذج إضافة صنف */}
          <div style={{ marginBottom: '16px', padding: '16px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={3}>
                <div style={{ marginBottom: 4, fontWeight: 500 }}>كود الصنف</div>
                <Input
                  value={item.itemNumber}
                  placeholder="كود الصنف"
                  disabled
                  readOnly
                  style={{ 
                    backgroundColor: '#f5f5f5', 
                    color: '#666',
                    fontFamily: 'monospace',
                    fontSize: 14,
                    fontWeight: 500
                  }}
                />
              </Col>
              <Col xs={24} sm={12} md={5}>
                <div style={{ marginBottom: 4, fontWeight: 500 }}>اسم الصنف</div>
                <Space.Compact style={{ width: '100%' }}>
                  <Select
                    showSearch
                    value={item.itemName}
                    style={{ width: 'calc(100% - 40px)', fontFamily: 'Cairo, sans-serif' }}
                    placeholder="اسم الصنف"
                    optionLabelProp="label"
                    onChange={(value) => {
                      if (!value) {
                        // إذا تم مسح التحديد
                        handleClearItem();
                        return;
                      }
                      
                      const selectedItem = inventoryItems.find(i => i.name === value);
                      
                      // فحص إذا كان الصنف موقوف مؤقتاً
                      if (selectedItem && selectedItem.tempCodes) {
                        message.warning(`تم إيقاف الصنف "${value}" مؤقتاً ولا يمكن إضافته للفاتورة`);
                        // إعادة تعيين اختيار الصنف
                        handleClearItem();
                        return;
                      }
                      
                      if (selectedItem) {
                        setItem({
                          ...item,
                          itemName: value,
                          itemNumber: selectedItem.itemCode || '',
                          price: String(selectedItem.salePrice || 0),
                          unit: selectedItem.unit || 'قطعة',
                          discountPercent: selectedItem.discount ? String(selectedItem.discount) : '0'
                        });
                      } else {
                        setItem({ ...item, itemName: value, itemNumber: '' });
                      }
                    }}
                    filterOption={(input, option) => {
                      const itemName = String(option?.value ?? '').toLowerCase();
                      const selectedItem = inventoryItems.find(i => i.name === option?.value);
                      const itemCode = String(selectedItem?.itemCode ?? '').toLowerCase();
                      const searchTerm = input.toLowerCase();
                      return itemName.includes(searchTerm) || itemCode.includes(searchTerm);
                    }}
                    allowClear
                  >
                    {inventoryItems.map((inventoryItem, index) => (
                      <Select.Option 
                        key={inventoryItem.id || `${inventoryItem.name}-${index}`} 
                        value={inventoryItem.name}
                        label={inventoryItem.name}
                        disabled={!!inventoryItem.tempCodes}
                        style={{
                          color: inventoryItem.tempCodes ? '#ff4d4f' : 'inherit',
                          backgroundColor: inventoryItem.tempCodes ? '#fff2f0' : 'inherit'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                            <span style={{ fontWeight: 600 }}>
                              {inventoryItem.name}
                              {inventoryItem.tempCodes ? (
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ verticalAlign: 'middle', marginLeft: 2 }}>
                                    <circle cx="12" cy="12" r="10" stroke="#ff4d4f" strokeWidth="2" fill="#fff2f0" />
                                    <path d="M8 12h8" stroke="#ff4d4f" strokeWidth="2" strokeLinecap="round" />
                                  </svg>
                                  (إيقاف مؤقت)
                                </span>
                              ) : ''}
                            </span>
                            {inventoryItem.itemCode && (
                              <span style={{ fontSize: '12px', color: '#666', fontFamily: 'monospace' }}>
                                كود: {inventoryItem.itemCode}
                              </span>
                            )}
                          </div>
                        </div>
                      </Select.Option>
                    ))}
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
              </Col>
              <Col xs={24} sm={12} md={2}>
                <div style={{ marginBottom: 4, fontWeight: 500 }}>الكمية</div>
                <Input
                  name="quantity"
                  value={item.quantity}
                  onChange={handleItemChange}
                  placeholder="الكمية"
                  type="number"
                  min={1}
                  style={{ paddingLeft: 6, paddingRight: 6, fontSize: 15 }}
                />
              </Col>
              <Col xs={24} sm={12} md={2}>
                <div style={{ marginBottom: 4, fontWeight: 500 }}>الوحدة</div>
                <Select
                  showSearch
                  value={item.unit}
                  onChange={(value) => setItem({...item, unit: value})}
                  style={{ width: '100%' }}
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
                  placeholder="% الضريبة" 
                  style={{ backgroundColor: '#f5f5f5' }}
                  type="number" 
                  min={0}
                  disabled
                  readOnly
                />
              </Col>
              <Col xs={24} sm={12} md={2}>
                <div style={{ marginBottom: 4, fontWeight: 500, visibility: 'hidden' }}>
                  {editingItemIndex !== null ? 'تحديث' : 'إضافة'}
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                  <Button 
                    type="primary"
                    onClick={handleAddItem}
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
                        handleClearItem();
                        message.info('تم إلغاء التعديل');
                      }}
                      style={{
                        backgroundColor: '#ff4d4f',
                        borderColor: '#ff4d4f',
                        color: '#fff'
                      }}
                      title="إلغاء التعديل"
                      icon={
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      }
                    />
                  )}
                </div>
              </Col>
            </Row>
          </div>

          {/* جدول الأصناف */}
          <Table
            columns={columns}
            dataSource={items}
            rowKey={(record, index) => `${record.itemName}-${index}`}
            pagination={false}
            scroll={{ x: 1200 }}
            size="small"
          />
          
          {/* المجاميع */}
          <Row gutter={16} justify="end" className="mb-4" style={{ marginTop: '16px' }}>
            <Col xs={24} sm={12} md={6}>
              <Card size="small">
                <div className="flex justify-between" style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#2563eb', fontWeight: 600 }}>الإجمالي:</span>
                  <span className="font-bold" style={{ color: '#2563eb', fontWeight: 'bold' }}>{totals.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between" style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#dc2626', fontWeight: 600 }}>الخصم:</span>
                  <span className="font-bold" style={{ color: '#dc2626', fontWeight: 'bold' }}>{(totals.total - totals.afterDiscount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between" style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#ea580c', fontWeight: 600 }}>الإجمالي بعد الخصم:</span>
                  <span className="font-bold" style={{ color: '#ea580c', fontWeight: 'bold' }}>{totals.afterDiscount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between" style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#9333ea', fontWeight: 600 }}>قيمة الضريبة:</span>
                  <span className="font-bold" style={{ color: '#9333ea', fontWeight: 'bold' }}>{totals.tax.toFixed(2)}</span>
                </div>
                <Divider className="my-2" style={{ margin: '8px 0' }} />
                <div className="flex justify-between" style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#059669', fontWeight: 700 }}>الإجمالي النهائي:</span>
                  <span className="font-bold text-lg" style={{ color: '#059669', fontWeight: 'bold', fontSize: '18px' }}>{totals.afterTax.toFixed(2)}</span>
                </div>
              </Card>
            </Col>
          </Row>
        </Card>

        {/* معلومات الدفع */}
        <Divider orientation="left" style={{ fontFamily: 'Cairo, sans-serif', marginBottom: 16 }}>
          معلومات الدفع
        </Divider>
        <Card style={{ marginBottom: '24px' }}>
          <Row gutter={16}>
            <Col xs={24} sm={12} md={8}>
              <Form.Item
                label="طريقة الدفع"
                name="paymentMethod"
                rules={[{ required: true, message: 'طريقة الدفع مطلوبة' }]}
              >
                <Select 
                  placeholder="اختر طريقة الدفع"
                  onChange={(value) => {
                    // إعادة تعيين الصندوق النقدي عند تغيير طريقة الدفع
                    if (value !== 'نقدي') {
                      form.setFieldValue('cashBox', undefined);
                    }
                  }}
                >
                  {paymentMethods.map(method => (
                    <Option key={method} value={method}>{method}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Form.Item dependencies={['paymentMethod']}>
                {({ getFieldValue }) => {
                  const paymentMethod = getFieldValue('paymentMethod');
                  return (
                    <Form.Item
                      label="الصندوق النقدي"
                      name="cashBox"
                      rules={[
                        {
                          required: paymentMethod === 'نقدي',
                          message: 'الصندوق النقدي مطلوب للدفع النقدي'
                        }
                      ]}
                    >
                      <Select 
                        placeholder="اختر الصندوق النقدي"
                        disabled={paymentMethod !== 'نقدي'}
                      >
                        {cashBoxes
                          .filter(cashBox => !getFieldValue('branch') || cashBox.branch === getFieldValue('branch'))
                          .map(cashBox => (
                            <Option key={cashBox.id || cashBox.nameAr} value={cashBox.id || cashBox.nameAr}>
                              {cashBox.nameAr}
                            </Option>
                          ))}
                      </Select>
                    </Form.Item>
                  );
                }}
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* أزرار الحفظ */}
        <Card>
          <div style={{ textAlign: 'center' }}>
            <Space size="large">
              <Button
                size="large"
                onClick={() => navigate('/stores/edit-sales-invoice')}
              >
                إلغاء
              </Button>
              <Button
                type="primary"
                size="large"
                icon={<SaveOutlined />}
                loading={saving}
                onClick={handleSave}
              >
                حفظ التعديلات
              </Button>
            </Space>
          </div>
        </Card>
      </Form>

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
          onFinish={handleAddNewItem}
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
            <Col span={8}>
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
  );
};

export default EditSalesInvoiceDetailPage;
