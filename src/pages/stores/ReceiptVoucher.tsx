import React, { useState } from 'react';
import { 
  Card, 
  Form, 
  Input, 
  Button, 
  Select, 
  DatePicker, 
  InputNumber, 
  Table, 
  Space, 
  Row, 
  Col, 
  Typography, 
  Divider, 
  Modal, 
  message,
  Tag,
  Tooltip,
  Descriptions
} from 'antd';
import { 
  PlusOutlined, 
  DeleteOutlined, 
  PrinterOutlined, 
  SaveOutlined,
  SearchOutlined,
  UserOutlined,
  BankOutlined,
  CreditCardOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import { Receipt, ArrowRight } from 'lucide-react';
import Breadcrumb from "@/components/Breadcrumb";
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

interface ReceiptItem {
  key: string;
  invoiceNumber: string;
  invoiceDate: string;
  originalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  currentPayment: number;
}

interface Customer {
  id: string;
  name: string;
  code: string;
  balance: number;
  phone: string;
}

const ReceiptVoucher: React.FC = () => {
  const [form] = Form.useForm();
  const [receiptItems, setReceiptItems] = useState<ReceiptItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerModalVisible, setCustomerModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  // بيانات وهمية للعملاء
  const customersData: Customer[] = [
    { id: '1', name: 'أحمد محمد علي', code: 'C001', balance: 15000, phone: '01234567890' },
    { id: '2', name: 'فاطمة أحمد محمود', code: 'C002', balance: 8500, phone: '01234567891' },
    { id: '3', name: 'محمد حسن إبراهيم', code: 'C003', balance: 22000, phone: '01234567892' },
    { id: '4', name: 'سارة محمود عبدالله', code: 'C004', balance: 12300, phone: '01234567893' },
    { id: '5', name: 'عمر خالد محمد', code: 'C005', balance: 7800, phone: '01234567894' },
  ];

  // بيانات وهمية للفواتير المستحقة
  const invoicesData: ReceiptItem[] = [
    {
      key: '1',
      invoiceNumber: 'INV-2024-001',
      invoiceDate: '2024-01-15',
      originalAmount: 5000,
      paidAmount: 2000,
      remainingAmount: 3000,
      currentPayment: 0
    },
    {
      key: '2',
      invoiceNumber: 'INV-2024-015',
      invoiceDate: '2024-02-10',
      originalAmount: 7500,
      paidAmount: 0,
      remainingAmount: 7500,
      currentPayment: 0
    },
    {
      key: '3',
      invoiceNumber: 'INV-2024-032',
      invoiceDate: '2024-03-05',
      originalAmount: 4500,
      paidAmount: 1500,
      remainingAmount: 3000,
      currentPayment: 0
    }
  ];

  const paymentMethods = [
    { value: 'cash', label: 'نقدي', icon: <CreditCardOutlined /> },
    { value: 'bank', label: 'تحويل بنكي', icon: <BankOutlined /> },
    { value: 'check', label: 'شيك', icon: <FileTextOutlined /> },
    { value: 'credit_card', label: 'بطاقة ائتمان', icon: <CreditCardOutlined /> }
  ];

  const columns = [
    {
      title: 'رقم الفاتورة',
      dataIndex: 'invoiceNumber',
      key: 'invoiceNumber',
      render: (text: string) => <Text strong>{text}</Text>
    },
    {
      title: 'تاريخ الفاتورة',
      dataIndex: 'invoiceDate',
      key: 'invoiceDate',
      render: (date: string) => dayjs(date).format('DD/MM/YYYY')
    },
    {
      title: 'المبلغ الأصلي',
      dataIndex: 'originalAmount',
      key: 'originalAmount',
      render: (amount: number) => (
        <Text>{amount.toLocaleString()} ج.م</Text>
      )
    },
    {
      title: 'المدفوع مسبقاً',
      dataIndex: 'paidAmount',
      key: 'paidAmount',
      render: (amount: number) => (
        <Text type="success">{amount.toLocaleString()} ج.م</Text>
      )
    },
    {
      title: 'المتبقي',
      dataIndex: 'remainingAmount',
      key: 'remainingAmount',
      render: (amount: number) => (
        <Text type="danger">{amount.toLocaleString()} ج.م</Text>
      )
    },
    {
      title: 'المبلغ المدفوع الآن',
      dataIndex: 'currentPayment',
      key: 'currentPayment',
      render: (value: number, record: ReceiptItem) => (
        <InputNumber
          min={0}
          max={record.remainingAmount}
          value={value}
          onChange={(val) => handlePaymentChange(record.key, val || 0)}
          style={{ width: '120px' }}
          formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
          parser={(value) => Number(value!.replace(/\$\s?|(,*)/g, ''))}
        />
      )
    },
    {
      title: 'المتبقي بعد الدفع',
      key: 'finalRemaining',
      render: (_, record: ReceiptItem) => {
        const remaining = record.remainingAmount - record.currentPayment;
        return (
          <Text type={remaining === 0 ? "success" : "warning"}>
            {remaining.toLocaleString()} ج.م
          </Text>
        );
      }
    }
  ];

  const customerColumns = [
    {
      title: 'كود العميل',
      dataIndex: 'code',
      key: 'code',
      width: 100
    },
    {
      title: 'اسم العميل',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: 'رقم الهاتف',
      dataIndex: 'phone',
      key: 'phone'
    },
    {
      title: 'الرصيد المستحق',
      dataIndex: 'balance',
      key: 'balance',
      render: (balance: number) => (
        <Text type="danger">{balance.toLocaleString()} ج.م</Text>
      )
    },
    {
      title: 'إجراء',
      key: 'action',
      width: 100,
      render: (_: unknown, record: Customer) => (
        <Button 
          type="primary" 
          size="small"
          onClick={() => selectCustomer(record)}
        >
          اختيار
        </Button>
      )
    }
  ];

  const handlePaymentChange = (key: string, value: number) => {
    setReceiptItems(prev => 
      prev.map(item => 
        item.key === key ? { ...item, currentPayment: value } : item
      )
    );
  };

  const selectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setReceiptItems(invoicesData);
    setCustomerModalVisible(false);
    
    // تحديث النموذج
    form.setFieldsValue({
      customerName: customer.name,
      customerCode: customer.code
    });
  };

  const getTotalPayment = () => {
    return receiptItems.reduce((sum, item) => sum + item.currentPayment, 0);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      
      const totalPayment = getTotalPayment();
      if (totalPayment === 0) {
        message.error('يجب إدخال مبلغ الدفع');
        return;
      }

      // هنا يمكن إضافة منطق حفظ البيانات
      console.log('Receipt Data:', {
        ...values,
        customer: selectedCustomer,
        items: receiptItems.filter(item => item.currentPayment > 0),
        totalAmount: totalPayment
      });

      message.success('تم حفظ سند القبض بنجاح');
      
      // إعادة تعيين النموذج
      form.resetFields();
      setSelectedCustomer(null);
      setReceiptItems([]);
      
    } catch (error) {
      message.error('خطأ في حفظ البيانات');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    message.info('سيتم إضافة وظيفة الطباعة قريباً');
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen" dir="rtl">
      {/* Header */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Receipt className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <Title level={2} className="!mb-0">سند قبض</Title>
            <Text type="secondary">تسجيل سندات القبض من العملاء</Text>
          </div>
        </div>
      </div>

      <Breadcrumb
        items={[
          { label: "الرئيسية", to: "/" },
          { label: "إدارة المبيعات", to: "/management/sales" },
          { label: "سند قبض" }
        ]}
      />

      <Row gutter={[16, 16]} className="mt-6">
        {/* معلومات السند */}
        <Col span={24}>
          <Card title="معلومات سند القبض" className="shadow-sm">
            <Form form={form} layout="vertical">
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item
                    label="رقم السند"
                    name="receiptNumber"
                    rules={[{ required: true, message: 'رقم السند مطلوب' }]}
                  >
                    <Input 
                      placeholder="سيتم إنشاؤه تلقائياً"
                      prefix={<FileTextOutlined />}
                      disabled
                    />
                  </Form.Item>
                </Col>
                
                <Col xs={24} sm={12} md={8}>
                  <Form.Item
                    label="تاريخ السند"
                    name="receiptDate"
                    rules={[{ required: true, message: 'تاريخ السند مطلوب' }]}
                    initialValue={dayjs()}
                  >
                    <DatePicker 
                      style={{ width: '100%' }} 
                      format="DD/MM/YYYY"
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12} md={8}>
                  <Form.Item
                    label="طريقة الدفع"
                    name="paymentMethod"
                    rules={[{ required: true, message: 'طريقة الدفع مطلوبة' }]}
                  >
                    <Select placeholder="اختر طريقة الدفع">
                      {paymentMethods.map(method => (
                        <Option key={method.value} value={method.value}>
                          <Space>
                            {method.icon}
                            {method.label}
                          </Space>
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12} md={8}>
                  <Form.Item label="العميل" required>
                    <Space.Compact style={{ width: '100%' }}>
                      <Input
                        value={selectedCustomer?.name || ''}
                        placeholder="اختر العميل"
                        readOnly
                        prefix={<UserOutlined />}
                      />
                      <Button
                        type="primary"
                        icon={<SearchOutlined />}
                        onClick={() => setCustomerModalVisible(true)}
                      >
                        اختيار
                      </Button>
                    </Space.Compact>
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12} md={8}>
                  <Form.Item
                    label="رقم المرجع"
                    name="referenceNumber"
                  >
                    <Input placeholder="رقم مرجعي اختياري" />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12} md={8}>
                  <Form.Item
                    label="رقم الحساب البنكي"
                    name="bankAccount"
                  >
                    <Input placeholder="رقم الحساب (في حالة التحويل البنكي)" />
                  </Form.Item>
                </Col>

                <Col xs={24}>
                  <Form.Item
                    label="ملاحظات"
                    name="notes"
                  >
                    <TextArea rows={3} placeholder="ملاحظات إضافية..." />
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </Card>
        </Col>

        {/* معلومات العميل */}
        {selectedCustomer && (
          <Col span={24}>
            <Card title="معلومات العميل" className="shadow-sm">
              <Descriptions column={{ xs: 1, sm: 2, md: 4 }}>
                <Descriptions.Item label="كود العميل">
                  <Tag color="blue">{selectedCustomer.code}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="اسم العميل">
                  {selectedCustomer.name}
                </Descriptions.Item>
                <Descriptions.Item label="رقم الهاتف">
                  {selectedCustomer.phone}
                </Descriptions.Item>
                <Descriptions.Item label="إجمالي المستحق">
                  <Text type="danger" strong>
                    {selectedCustomer.balance.toLocaleString()} ج.م
                  </Text>
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>
        )}

        {/* الفواتير المستحقة */}
        {receiptItems.length > 0 && (
          <Col span={24}>
            <Card 
              title="الفواتير المستحقة" 
              className="shadow-sm"
              extra={
                <Tag color="orange">
                  إجمالي المحدد: {getTotalPayment().toLocaleString()} ج.م
                </Tag>
              }
            >
              <Table
                columns={columns}
                dataSource={receiptItems}
                pagination={false}
                scroll={{ x: 800 }}
                summary={() => (
                  <Table.Summary.Row style={{ backgroundColor: '#f5f5f5' }}>
                    <Table.Summary.Cell index={0} colSpan={5}>
                      <Text strong>الإجمالي</Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={1}>
                      <Text strong>{getTotalPayment().toLocaleString()} ج.م</Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={2}>
                      <Text strong>
                        {receiptItems.reduce((sum, item) => 
                          sum + (item.remainingAmount - item.currentPayment), 0
                        ).toLocaleString()} ج.م
                      </Text>
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                )}
              />
            </Card>
          </Col>
        )}

        {/* أزرار الحفظ والطباعة */}
        <Col span={24}>
          <Card className="shadow-sm">
            <div className="flex justify-end gap-4">
              <Button size="large" onClick={() => window.history.back()}>
                إلغاء
              </Button>
              <Button 
                type="default" 
                size="large" 
                icon={<PrinterOutlined />}
                onClick={handlePrint}
                disabled={!selectedCustomer || getTotalPayment() === 0}
              >
                طباعة
              </Button>
              <Button 
                type="primary" 
                size="large" 
                icon={<SaveOutlined />}
                onClick={handleSave}
                loading={loading}
                disabled={!selectedCustomer || getTotalPayment() === 0}
              >
                حفظ السند
              </Button>
            </div>
          </Card>
        </Col>
      </Row>

      {/* مودال اختيار العميل */}
      <Modal
        title="اختيار العميل"
        open={customerModalVisible}
        onCancel={() => setCustomerModalVisible(false)}
        footer={null}
        width={800}
      >
        <Table
          columns={customerColumns}
          dataSource={customersData}
          rowKey="id"
          pagination={{ pageSize: 5 }}
          size="small"
        />
      </Modal>
    </div>
  );
};

export default ReceiptVoucher;
