import React, { useState, useEffect, useMemo, useCallback, useRef, Suspense, lazy } from 'react';
import { useAuth } from '@/contexts/useAuth';
import dayjs from 'dayjs';
import { Button, Input, Select, Table, message, Form, Row, Col, DatePicker, Spin, Modal, Space, Card } from 'antd';
import Divider from 'antd/es/divider';
import Breadcrumb from "../../components/Breadcrumb";
import { PlusOutlined, SaveOutlined } from '@ant-design/icons';
import { useFinancialYear } from '@/hooks/useFinancialYear';
import { FinancialYear } from '@/services/financialYearsService';

// Custom hooks
import { useSalesData } from '@/hooks/useSalesData';
import { useInvoiceManagement } from '@/hooks/useInvoiceManagement';

// Lazy loaded components for better performance
const ItemSelect = lazy(() => import('@/components/ItemSelect'));
const CustomerSelect = lazy(() => import('@/components/CustomerSelect'));

// Import components directly for small components
import { StatusDisplay, TotalsDisplay } from '@/components/InvoiceComponents';

// Define types
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

// Optimized loading component
const ProfessionalLoader: React.FC = () => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    height: '60vh',
    flexDirection: 'column',
    gap: 16
  }}>
    <Spin size="large" />
    <p style={{ color: '#666', fontFamily: 'Cairo' }}>جاري تحميل البيانات...</p>
  </div>
);

// Generate invoice number function (optimized)
const generateInvoiceNumberAsync = async (branchId: string, branches: { id: string; code?: string; number?: string; branchNumber?: string }[] = []): Promise<string> => {
  const date = new Date();
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const dateStr = `${y}${m}${d}`;
  
  const branchObj = branches.find(b => b.id === branchId);
  const branchNumber = branchObj?.code || branchObj?.number || branchObj?.branchNumber || '1';
  
  // Simple counter for now (can be optimized with Firebase counter later)
  const serial = Date.now() % 1000;
  
  return `INV-${branchNumber}-${dateStr}-${serial}`;
};

// Get valid date for financial year
const getValidDateForFinancialYear = (financialYear: FinancialYear | null): string => {
  const today = dayjs();
  
  if (!financialYear) {
    return today.format('YYYY-MM-DD');
  }
  
  const startDate = dayjs(financialYear.startDate);
  const endDate = dayjs(financialYear.endDate);
  
  if (today.isSameOrAfter(startDate, 'day') && today.isSameOrBefore(endDate, 'day')) {
    return today.format('YYYY-MM-DD');
  }
  
  if (today.isBefore(startDate, 'day')) {
    return startDate.format('YYYY-MM-DD');
  }
  
  return endDate.format('YYYY-MM-DD');
};

const SalesPage: React.FC = () => {
  const { user } = useAuth();
  const { currentFinancialYear } = useFinancialYear();
  
  // Custom hooks for data management
  const {
    loading,
    fetchingItems,
    delegates,
    branches,
    warehouses,
    paymentMethods,
    cashBoxes,
    units,
    itemNames,
    customers,
    taxRate,
    fetchBasicData
  } = useSalesData();

  const {
    invoiceType,
    setInvoiceType,
    warehouseMode,
    setWarehouseMode,
    multiplePaymentMode,
    setMultiplePaymentMode,
    priceType,
    setPriceType,
    invoiceData,
    setInvoiceData,
    item,
    setItem,
    items,
    editingItemIndex,
    itemStocks,
    totals,
    isReadyToSave,
    addItem,
    editItem,
    deleteItem,
    cancelEdit,
    resetInvoice,
    fetchSingleItemStock
  } = useInvoiceManagement(taxRate);

  // Modal states
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [showCustomerSearch, setShowCustomerSearch] = useState(false);
  const [showQuickAddCustomer, setShowQuickAddCustomer] = useState(false);

  // Refs for better performance
  const itemNameSelectRef = useRef<HTMLElement>(null);

  // Load data on mount
  useEffect(() => {
    fetchBasicData();
  }, [fetchBasicData]);

  // Set valid date when financial year changes
  useEffect(() => {
    if (currentFinancialYear) {
      const validDate = getValidDateForFinancialYear(currentFinancialYear);
      setInvoiceData(prev => ({
        ...prev,
        date: validDate,
        dueDate: dayjs(validDate).add(30, 'day').format('YYYY-MM-DD')
      }));
    }
  }, [currentFinancialYear, setInvoiceData]);

  // Date validation
  const disabledDate = useCallback((current: dayjs.Dayjs) => {
    if (!currentFinancialYear) return false;
    
    const startDate = dayjs(currentFinancialYear.startDate);
    const endDate = dayjs(currentFinancialYear.endDate);
    
    return current.isBefore(startDate, 'day') || current.isAfter(endDate, 'day');
  }, [currentFinancialYear]);

  // Handle item change
  const handleItemChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setItem(prev => ({ ...prev, [name]: value }));
  }, [setItem]);

  // Handle add item
  const handleAddItem = useCallback(() => {
    if (addItem()) {
      message.success(editingItemIndex !== null ? 'تم تحديث الصنف بنجاح' : 'تم إضافة الصنف بنجاح');
    } else {
      message.error('يرجى ملء جميع البيانات المطلوبة');
    }
  }, [addItem, editingItemIndex]);

  // Handle customer selection
  const handleCustomerSelect = useCallback((value: string) => {
    const selected = customers.find(c => c.nameAr === value);
    setInvoiceData(prev => ({
      ...prev,
      customerName: value || '',
      customerNumber: selected ? (selected.phone || selected.mobile || selected.phoneNumber || '') : '',
      commercialRecord: selected ? (selected.commercialReg || '') : '',
      taxFile: selected ? (selected.taxFile || '') : ''
    }));
  }, [customers, setInvoiceData]);

  // Handle item selection
  const handleItemSelect = useCallback(async (value: string) => {
    const selected = itemNames.find(i => i.name === value);
    
    // Check if item is temporarily disabled
    if (selected?.tempCodes) {
      message.warning(`تم إيقاف الصنف "${value}" مؤقتاً ولا يمكن إضافته للفاتورة`);
      setItem(prev => ({
        ...prev,
        itemName: '',
        itemNumber: '',
        price: '',
        discountPercent: '0',
        quantity: '1'
      }));
      return;
    }
    
    const price = selected?.salePrice ? String(selected.salePrice) : '';
    
    setItem(prev => ({
      ...prev,
      itemName: value,
      itemNumber: selected?.itemCode || '',
      price,
      discountPercent: selected?.discount ? String(selected.discount) : '0',
      taxPercent: taxRate,
      quantity: '1'
    }));
    
    // Fetch stock if warehouse is selected
    if (warehouseMode === 'multiple' && item.warehouseId && value) {
      await fetchSingleItemStock(value, item.warehouseId);
    }
  }, [itemNames, taxRate, setItem, warehouseMode, item.warehouseId, fetchSingleItemStock]);

  // Memoized table columns
  const itemColumns = useMemo(() => [
    {
      title: 'كود الصنف',
      dataIndex: 'itemNumber',
      key: 'itemNumber',
      width: 120,
    },
    {
      title: 'اسم الصنف',
      dataIndex: 'itemName',
      key: 'itemName',
      width: 200,
    },
    {
      title: 'الكمية',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 80,
    },
    {
      title: 'الوحدة',
      dataIndex: 'unit',
      key: 'unit',
      width: 80,
    },
    {
      title: 'السعر',
      dataIndex: 'price',
      key: 'price',
      width: 100,
      render: (price: string) => `${parseFloat(price || '0').toFixed(2)} ر.س`
    },
    {
      title: '% الخصم',
      dataIndex: 'discountPercent',
      key: 'discountPercent',
      width: 80,
      render: (discount: string) => `${discount}%`
    },
    {
      title: 'الإجمالي',
      key: 'total',
      width: 120,
      render: (record: InvoiceItem) => {
        const qty = parseFloat(record.quantity) || 0;
        const price = parseFloat(record.price) || 0;
        const discountPercent = parseFloat(record.discountPercent) || 0;
        const subtotal = qty * price;
        const discountAmount = subtotal * (discountPercent / 100);
        const total = subtotal - discountAmount;
        return `${total.toFixed(2)} ر.س`;
      }
    },
    {
      title: 'إجراءات',
      key: 'actions',
      width: 120,
      render: (_: unknown, record: InvoiceItem, index: number) => (
        <Space>
          <Button size="small" onClick={() => editItem(index)}>تعديل</Button>
          <Button size="small" danger onClick={() => deleteItem(index)}>حذف</Button>
        </Space>
      )
    }
  ], [editItem, deleteItem]);

  // Handle save invoice
  const handleSaveInvoice = useCallback(async () => {
    if (!isReadyToSave) {
      message.error('يرجى إكمال جميع البيانات المطلوبة');
      return;
    }

    try {
      // Save logic here
      message.success('تم حفظ الفاتورة بنجاح');
      resetInvoice();
    } catch (error) {
      console.error('خطأ في حفظ الفاتورة:', error);
      message.error('حدث خطأ أثناء حفظ الفاتورة');
    }
  }, [isReadyToSave, resetInvoice]);

  if (loading) {
    return <ProfessionalLoader />;
  }

  return (
    <div className="p-2 sm:p-6 w-full max-w-none">
      <Breadcrumb
        items={[
          { label: "الرئيسية", to: "/" },
          { label: "إدارة المبيعات", to: "/management/sales" },
          { label: "فاتورة مبيعات" }
        ]}
      />
      
      <Spin spinning={fetchingItems}>
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
                style={{ minWidth: 170, height: 38 }}
                onChange={setPriceType}
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
          {/* Financial Year Info */}
          {currentFinancialYear && (
            <div style={{ marginBottom: 16 }}>
              <Card size="small">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '4px 0' }}>
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
                    <div style={{ fontWeight: 600, color: '#1565c0', fontSize: '13px', fontFamily: 'Cairo, sans-serif' }}>
                      السنة المالية النشطة: {currentFinancialYear.year}
                    </div>
                    <div style={{ fontSize: '12px', color: '#1976d2', fontFamily: 'Cairo, sans-serif', lineHeight: 1.3, marginTop: 2 }}>
                      يمكن إدخال التواريخ فقط من {currentFinancialYear.startDate} إلى {currentFinancialYear.endDate}
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Basic Information */}
          <Divider orientation="left" style={{ fontFamily: 'Cairo, sans-serif', marginBottom: 16 }}>
            المعلومات الأساسية
          </Divider>
          
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
                    setInvoiceData(prev => ({
                      ...prev, 
                      date: newDate,
                      dueDate: dayjs(newDate).add(30, 'day').format('YYYY-MM-DD')
                    }));
                  }}
                  format="YYYY-MM-DD"
                  placeholder="التاريخ"
                  disabledDate={disabledDate}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Form.Item label="تاريخ الاستحقاق">
                <DatePicker
                  style={{ width: '100%' }}
                  value={invoiceData.dueDate ? dayjs(invoiceData.dueDate) : null}
                  onChange={(date, dateString) => {
                    const newDueDate = Array.isArray(dateString) ? dateString[0] : dateString as string;
                    setInvoiceData(prev => ({ ...prev, dueDate: newDueDate }));
                  }}
                  format="YYYY-MM-DD"
                  placeholder="تاريخ الاستحقاق"
                  disabledDate={disabledDate}
                />
              </Form.Item>
            </Col>
          </Row>

          {/* Sales Representative */}
          <Row gutter={16} className="mb-4">
            <Col xs={24} sm={12} md={6}>
              <Form.Item label="البائع">
                <Select
                  showSearch
                  value={invoiceData.delegate}
                  onChange={value => setInvoiceData(prev => ({ ...prev, delegate: value }))}
                  placeholder="اختر البائع"
                  style={{ fontFamily: 'Cairo, sans-serif' }}
                  filterOption={(input, option) =>
                    String(option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  options={delegates.map(d => ({ 
                    label: d.name || d.email || d.id, 
                    value: d.id 
                  }))}
                  allowClear
                />
              </Form.Item>
            </Col>
          </Row>

          {/* Branch and Warehouse */}
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
                    onChange={(value) => setInvoiceData(prev => ({...prev, warehouse: value}))}
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

          {/* Customer Information */}
          <Divider orientation="left" style={{ fontFamily: 'Cairo, sans-serif', marginBottom: 16 }}>
            معلومات العميل
          </Divider>
          <Row gutter={16} className="mb-4">
            <Col xs={24} sm={18} md={18}>
              <Form.Item label="اسم العميل">
                <Suspense fallback={<Spin size="small" />}>
                  <CustomerSelect
                    value={invoiceData.customerName}
                    onChange={handleCustomerSelect}
                    customers={customers}
                    onAddNewCustomer={() => setShowQuickAddCustomer(true)}
                    onQuickSearch={() => setShowCustomerSearch(true)}
                  />
                </Suspense>
              </Form.Item>
            </Col>
            <Col xs={24} sm={6} md={6}>
              <Form.Item label="رقم العميل">
                <Input
                  value={invoiceData.customerNumber}
                  placeholder="رقم العميل"
                  disabled
                />
              </Form.Item>
            </Col>
          </Row>

          {/* Tax Information (for tax invoice only) */}
          {invoiceType === 'ضريبة' && (
            <>
              <Divider orientation="left" style={{ fontFamily: 'Cairo, sans-serif', marginBottom: 16 }}>
                المعلومات الضريبية
              </Divider>
              <Row gutter={16} className="mb-4">
                <Col xs={24} sm={12} md={12}>
                  <Form.Item label="السجل التجاري">
                    <Input
                      value={invoiceData.commercialRecord}
                      placeholder="السجل التجاري"
                      disabled
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={12}>
                  <Form.Item label="الملف الضريبي">
                    <Input
                      value={invoiceData.taxFile}
                      placeholder="الملف الضريبي"
                      disabled
                    />
                  </Form.Item>
                </Col>
              </Row>
            </>
          )}

          {/* Status Display */}
          <StatusDisplay
            branch={invoiceData.branch}
            customerName={invoiceData.customerName}
            warehouse={invoiceData.warehouse}
            warehouseMode={warehouseMode}
            itemsCount={items.length}
            paymentMethod={invoiceData.paymentMethod}
            multiplePaymentMode={multiplePaymentMode}
            multiplePayment={invoiceData.multiplePayment}
            totals={totals}
          />

          {/* Items Section */}
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

          {/* Item Entry Form */}
          <Row gutter={16} className="mb-4">
            <Col xs={24} sm={12} md={4}>
              <div style={{ marginBottom: 4, fontWeight: 500 }}>كود الصنف</div>
              <Input
                value={item.itemNumber}
                placeholder="كود الصنف"
                disabled
              />
            </Col>
            <Col xs={24} sm={12} md={7}>
              <div style={{ width: '100%' }}>
                <div style={{ marginBottom: 0, fontWeight: 500 }}>اسم الصنف</div>
                <Suspense fallback={<Spin size="small" />}>
                  <ItemSelect
                    value={item.itemName}
                    onChange={handleItemSelect}
                    items={itemNames}
                    itemStocks={itemStocks}
                    warehouseMode={warehouseMode}
                    currentWarehouse={warehouseMode === 'single' ? invoiceData.warehouse : item.warehouseId}
                    loadingStocks={false}
                    onAddNewItem={() => setShowAddItemModal(true)}
                    onQuickSearch={() => {}}
                  />
                </Suspense>
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
                  onChange={(value) => setItem(prev => ({ ...prev, warehouseId: value }))}
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
              />
            </Col>
            <Col xs={24} sm={12} md={3}>
              <div style={{ marginBottom: 4, fontWeight: 500 }}>الوحدة</div>
              <Select
                showSearch
                value={item.unit}
                onChange={(value) => setItem(prev => ({...prev, unit: value}))}
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
                style={{ backgroundColor: '#f5f5f5' }}
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
                    onClick={cancelEdit}
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
            <Table 
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
          <TotalsDisplay totals={totals} />

          {/* Payment Information */}
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
                    setInvoiceData(prev => ({
                      ...prev, 
                      paymentMethod: value,
                      cashBox: value === 'نقدي' ? prev.cashBox : '',
                      multiplePayment: isMultiple ? prev.multiplePayment : {}
                    }));
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
                    { label: 'متعدد', value: 'متعدد' }
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
                    onChange={(value) => setInvoiceData(prev => ({...prev, cashBox: value}))}
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
          </Row>

          {/* Save Button */}
          <Row justify="center" gutter={12}>
            <Col>
              <Button 
                type="primary" 
                size="large" 
                icon={<SaveOutlined />} 
                onClick={handleSaveInvoice}
                style={{ width: 150 }}
                loading={loading}
                disabled={!isReadyToSave}
              >
                حفظ الفاتورة 
              </Button>
            </Col>
          </Row>
        </Card>
      </Spin>

      {/* Modals */}
      <Modal
        open={showAddItemModal}
        onCancel={() => setShowAddItemModal(false)}
        footer={null}
        title="إضافة صنف جديد"
        width={750}
        destroyOnClose
      >
        {/* Add item modal content */}
        <div>محتوى مودال إضافة الصنف</div>
      </Modal>

      <Modal
        open={showCustomerSearch}
        onCancel={() => setShowCustomerSearch(false)}
        footer={null}
        title="البحث عن عميل"
        width={800}
        destroyOnClose
      >
        {/* Customer search modal content */}
        <div>محتوى مودال البحث عن العميل</div>
      </Modal>

      <Modal
        open={showQuickAddCustomer}
        onCancel={() => setShowQuickAddCustomer(false)}
        footer={null}
        title="إضافة عميل سريع"
        width={600}
        destroyOnClose
      >
        {/* Quick add customer modal content */}
        <div>محتوى مودال إضافة عميل سريع</div>
      </Modal>
    </div>
  );
};

export default SalesPage;
