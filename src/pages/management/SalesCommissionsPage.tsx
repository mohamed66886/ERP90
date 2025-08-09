import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Button, 
  Input, 
  Form, 
  Select, 
  Table, 
  Space, 
  Modal, 
  message, 
  Row, 
  Col, 
  Statistic, 
  Typography,
  InputNumber,
  Tag,
  Tooltip,
  DatePicker
} from 'antd';
import { 
  CrownOutlined,
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined,
  ExclamationCircleOutlined,
  DollarOutlined,
  PercentageOutlined,
  CalendarOutlined,
  UserOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ArrowLeftOutlined,
  BarChartOutlined,
  TrophyOutlined
} from '@ant-design/icons';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Breadcrumb from "@/components/Breadcrumb";
import { db } from "@/lib/firebase";
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc,
  query,
  where
} from "firebase/firestore";
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;
const { confirm } = Modal;

interface Commission {
  id?: string;
  representativeId: string;
  representativeName: string;
  salesPeriod: string;
  totalSales: number;
  commissionRate: number;
  commissionAmount: number;
  bonusAmount?: number;
  deductions?: number;
  finalAmount: number;
  status: 'pending' | 'approved' | 'paid';
  paymentDate?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface Representative {
  id: string;
  name: string;
  email: string;
  phone: string;
  commissionRate?: number;
}

const SalesCommissionsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const selectedRepFromURL = searchParams.get('rep');
  
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [representatives, setRepresentatives] = useState<Representative[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [selectedRep, setSelectedRep] = useState<string>(selectedRepFromURL || 'all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'paid'>('all');
  const [form] = Form.useForm();

  // Load commissions and representatives
  const loadData = async () => {
    setLoading(true);
    try {
      // Load representatives
      const repsSnapshot = await getDocs(collection(db, "salesRepresentatives"));
      const repsData = repsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Representative[];
      setRepresentatives(repsData);

      // Load existing commissions
      const commissionsSnapshot = await getDocs(collection(db, "salesCommissions"));
      const existingCommissions = commissionsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Commission[];

      // Load sales data to calculate commissions
      const salesSnapshot = await getDocs(collection(db, "sales_invoices"));
      const salesByRep: {[key: string]: {total: number, count: number}} = {};

      salesSnapshot.docs.forEach(doc => {
        const data = doc.data();
        const repId = data.delegate || data.representativeId;
        const total = data.totals?.total || 0;

        if (repId) {
          if (!salesByRep[repId]) {
            salesByRep[repId] = { total: 0, count: 0 };
          }
          salesByRep[repId].total += total;
          salesByRep[repId].count += 1;
        }
      });

      // Generate commission records for representatives with sales but no existing commission
      const generatedCommissions: Commission[] = [];
      Object.keys(salesByRep).forEach(repId => {
        const rep = repsData.find(r => r.id === repId);
        const hasExistingCommission = existingCommissions.some(c => c.representativeId === repId);
        
        if (rep && !hasExistingCommission && salesByRep[repId].total > 0) {
          const commissionRate = rep.commissionRate || 5; // Default 5%
          const totalSales = salesByRep[repId].total;
          const commissionAmount = (totalSales * commissionRate) / 100;
          
          generatedCommissions.push({
            representativeId: repId,
            representativeName: rep.name,
            salesPeriod: 'ديسمبر 2024',
            totalSales,
            commissionRate,
            commissionAmount,
            finalAmount: commissionAmount,
            status: 'pending',
            createdAt: new Date(),
            updatedAt: new Date()
          });
        }
      });

      // Combine existing and generated commissions
      const allCommissions = [...existingCommissions, ...generatedCommissions];
      setCommissions(allCommissions);
      
    } catch (error) {
      message.error('حدث خطأ في تحميل البيانات');
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Calculate final amount
  const calculateFinalAmount = (values: Partial<Commission>) => {
    const commissionAmount = (values.totalSales * values.commissionRate) / 100;
    const bonusAmount = values.bonusAmount || 0;
    const deductions = values.deductions || 0;
    return commissionAmount + bonusAmount - deductions;
  };

  // Handle form submission
  const handleSubmit = async (values: Partial<Commission>) => {
    try {
      setLoading(true);
      const commissionAmount = (values.totalSales * values.commissionRate) / 100;
      const finalAmount = calculateFinalAmount(values);

      const commissionData = {
        ...values,
        commissionAmount,
        finalAmount,
        representativeName: representatives.find(r => r.id === values.representativeId)?.name || '',
        createdAt: editId ? commissions.find(c => c.id === editId)?.createdAt : new Date(),
        updatedAt: new Date(),
      };

      if (editId) {
        await updateDoc(doc(db, "salesCommissions", editId), commissionData);
        message.success('تم تحديث العمولة بنجاح');
      } else {
        await addDoc(collection(db, "salesCommissions"), commissionData);
        message.success('تم إضافة العمولة بنجاح');
      }

      setShowModal(false);
      setEditId(null);
      form.resetFields();
      loadData();
    } catch (error) {
      message.error('حدث خطأ في حفظ البيانات');
    } finally {
      setLoading(false);
    }
  };

  // Handle edit
  const handleEdit = (record: Commission) => {
    setEditId(record.id || null);
    form.setFieldsValue({
      ...record,
      paymentDate: record.paymentDate ? dayjs(record.paymentDate) : null
    });
    setShowModal(true);
  };

  // Handle delete
  const handleDelete = (id: string) => {
    confirm({
      title: 'هل أنت متأكد من حذف هذه العمولة؟',
      icon: <ExclamationCircleOutlined />,
      content: 'لا يمكن التراجع عن هذا الإجراء',
      okText: 'حذف',
      okType: 'danger',
      cancelText: 'إلغاء',
      async onOk() {
        try {
          await deleteDoc(doc(db, "salesCommissions", id));
          message.success('تم حذف العمولة بنجاح');
          loadData();
        } catch (error) {
          message.error('حدث خطأ في حذف العمولة');
        }
      },
    });
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'orange';
      case 'approved': return 'blue';
      case 'paid': return 'green';
      default: return 'default';
    }
  };

  // Get status text
  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'في الانتظار';
      case 'approved': return 'موافق عليها';
      case 'paid': return 'تم الدفع';
      default: return status;
    }
  };

  // Table columns
  const columns = [
    {
      title: 'المندوب',
      dataIndex: 'representativeName',
      key: 'representativeName',
    },
    {
      title: 'فترة المبيعات',
      dataIndex: 'salesPeriod',
      key: 'salesPeriod',
    },
    {
      title: 'إجمالي المبيعات',
      dataIndex: 'totalSales',
      key: 'totalSales',
      render: (amount: number) => `${amount.toLocaleString()} ج.م`,
    },
    {
      title: 'نسبة العمولة',
      dataIndex: 'commissionRate',
      key: 'commissionRate',
      render: (rate: number) => `${rate}%`,
    },
    {
      title: 'مبلغ العمولة',
      dataIndex: 'commissionAmount',
      key: 'commissionAmount',
      render: (amount: number) => `${amount.toLocaleString()} ج.م`,
    },
    {
      title: 'المكافآت',
      dataIndex: 'bonusAmount',
      key: 'bonusAmount',
      render: (amount: number) => amount ? `${amount.toLocaleString()} ج.م` : '-',
    },
    {
      title: 'الخصومات',
      dataIndex: 'deductions',
      key: 'deductions',
      render: (amount: number) => amount ? `${amount.toLocaleString()} ج.م` : '-',
    },
    {
      title: 'المبلغ النهائي',
      dataIndex: 'finalAmount',
      key: 'finalAmount',
      render: (amount: number) => (
        <Text strong style={{ color: '#52c41a' }}>
          {amount.toLocaleString()} ج.م
        </Text>
      ),
    },
    {
      title: 'الحالة',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      ),
    },
    {
      title: 'تاريخ الدفع',
      dataIndex: 'paymentDate',
      key: 'paymentDate',
      render: (date: string) => date ? dayjs(date).format('YYYY-MM-DD') : '-',
    },
    {
      title: 'الإجراءات',
      key: 'actions',
      render: (_, record: Commission) => (
        <Space>
          <Tooltip title="تعديل">
            <Button 
              type="text" 
              icon={<EditOutlined />} 
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title="حذف">
            <Button 
              type="text" 
              danger 
              icon={<DeleteOutlined />} 
              onClick={() => handleDelete(record.id!)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const statistics = [
    {
      title: 'إجمالي العمولات',
      value: commissions.length,
      prefix: <CrownOutlined style={{ color: '#1890ff' }} />,
    },
    {
      title: 'في الانتظار',
      value: commissions.filter(c => c.status === 'pending').length,
      prefix: <ClockCircleOutlined style={{ color: '#faad14' }} />,
    },
    {
      title: 'موافق عليها',
      value: commissions.filter(c => c.status === 'approved').length,
      prefix: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
    },
    {
      title: 'إجمالي المبلغ المدفوع',
      value: commissions
        .filter(c => c.status === 'paid')
        .reduce((sum, c) => sum + c.finalAmount, 0),
      prefix: <DollarOutlined style={{ color: '#722ed1' }} />,
      formatter: (value: number) => `${value.toLocaleString()} ج.م`,
    },
  ];

  return (
    <div className="p-6" dir="rtl">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
        <div className="flex items-center justify-between">
          <div>
            <Title level={2} className="mb-0">عمولات المبيعات</Title>
            <Text type="secondary">حساب وإدارة عمولات المندوبين</Text>
          </div>
          <Space>
            <Button 
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate('/management/sales-representatives')}
            >
              العودة للمندوبين
            </Button>
            <Button 
              icon={<BarChartOutlined />}
              onClick={() => navigate('/management/performance-evaluation')}
            >
              تقييم الأداء
            </Button>
            <Button 
              icon={<TrophyOutlined />}
              onClick={() => navigate('/management/sales-targets')}
            >
              الأهداف
            </Button>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              size="large"
              onClick={() => {
                setEditId(null);
                form.resetFields();
                setShowModal(true);
              }}
            >
              إضافة عمولة جديدة
            </Button>
          </Space>
        </div>
      </div>

      <Breadcrumb
        items={[
          { label: "الرئيسية", to: "/" },
          { label: "إدارة المبيعات", to: "/management/sales" },
          { label: "عمولات المبيعات" }
        ]}
      />

      {/* Statistics */}
      <Row gutter={16} className="mb-6">
        {statistics.map((stat, index) => (
          <Col xs={24} sm={6} key={index}>
            <Card>
              <Statistic
                title={stat.title}
                value={stat.value}
                prefix={stat.prefix}
                formatter={stat.formatter}
              />
            </Card>
          </Col>
        ))}
      </Row>

      {/* Filters */}
      <Card className="mb-6">
        <Row gutter={16} align="middle">
          <Col xs={24} sm={8}>
            <Select
              style={{ width: '100%' }}
              placeholder="فلترة حسب المندوب"
              value={selectedRep}
              onChange={setSelectedRep}
              allowClear
            >
              <Option value="all">جميع المندوبين</Option>
              {representatives.map(rep => (
                <Option key={rep.id} value={rep.id}>{rep.name}</Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={8}>
            <Select
              style={{ width: '100%' }}
              placeholder="فلترة حسب الحالة"
              value={statusFilter}
              onChange={setStatusFilter}
            >
              <Option value="all">جميع الحالات</Option>
              <Option value="pending">في الانتظار</Option>
              <Option value="approved">موافق عليها</Option>
              <Option value="paid">تم الدفع</Option>
            </Select>
          </Col>
        </Row>
      </Card>

      {/* Commissions Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={commissions.filter(commission => {
            const matchesRep = selectedRep === 'all' || commission.representativeId === selectedRep;
            const matchesStatus = statusFilter === 'all' || commission.status === statusFilter;
            return matchesRep && matchesStatus;
          })}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1200 }}
          pagination={{
            total: commissions.filter(commission => {
              const matchesRep = selectedRep === 'all' || commission.representativeId === selectedRep;
              const matchesStatus = statusFilter === 'all' || commission.status === statusFilter;
              return matchesRep && matchesStatus;
            }).length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} من ${total} عمولة`,
          }}
        />
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        title={editId ? 'تعديل العمولة' : 'إضافة عمولة جديدة'}
        open={showModal}
        onCancel={() => {
          setShowModal(false);
          setEditId(null);
          form.resetFields();
        }}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="mt-4"
          onValuesChange={(_, allValues) => {
            if (allValues.totalSales && allValues.commissionRate) {
              const finalAmount = calculateFinalAmount(allValues);
              form.setFieldsValue({ 
                commissionAmount: (allValues.totalSales * allValues.commissionRate) / 100,
                finalAmount 
              });
            }
          }}
        >
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="representativeId"
                label="المندوب"
                rules={[{ required: true, message: 'يرجى اختيار المندوب' }]}
              >
                <Select placeholder="اختر المندوب" showSearch>
                  {representatives.map(rep => (
                    <Option key={rep.id} value={rep.id}>{rep.name}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="salesPeriod"
                label="فترة المبيعات"
                rules={[{ required: true, message: 'يرجى إدخال فترة المبيعات' }]}
              >
                <Input placeholder="مثال: يناير 2024, Q1 2024" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="totalSales"
                label="إجمالي المبيعات (ج.م)"
                rules={[{ required: true, message: 'يرجى إدخال إجمالي المبيعات' }]}
              >
                <InputNumber 
                  style={{ width: '100%' }}
                  min={0}
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value!.replace(/\$\s?|(,*)/g, '')}
                  placeholder="إجمالي المبيعات"
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="commissionRate"
                label="نسبة العمولة (%)"
                rules={[{ required: true, message: 'يرجى إدخال نسبة العمولة' }]}
              >
                <InputNumber 
                  style={{ width: '100%' }}
                  min={0}
                  max={100}
                  placeholder="نسبة العمولة"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="commissionAmount"
                label="مبلغ العمولة (ج.م)"
              >
                <InputNumber 
                  style={{ width: '100%' }}
                  disabled
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="bonusAmount"
                label="المكافآت (ج.م)"
              >
                <InputNumber 
                  style={{ width: '100%' }}
                  min={0}
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value!.replace(/\$\s?|(,*)/g, '')}
                  placeholder="المكافآت الإضافية"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="deductions"
                label="الخصومات (ج.م)"
              >
                <InputNumber 
                  style={{ width: '100%' }}
                  min={0}
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value!.replace(/\$\s?|(,*)/g, '')}
                  placeholder="الخصومات"
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="finalAmount"
                label="المبلغ النهائي (ج.م)"
              >
                <InputNumber 
                  style={{ width: '100%' }}
                  disabled
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="status"
                label="الحالة"
                rules={[{ required: true, message: 'يرجى اختيار الحالة' }]}
              >
                <Select placeholder="اختر الحالة">
                  <Option value="pending">في الانتظار</Option>
                  <Option value="approved">موافق عليها</Option>
                  <Option value="paid">تم الدفع</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="paymentDate"
                label="تاريخ الدفع"
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="notes" label="ملاحظات">
            <Input.TextArea placeholder="ملاحظات إضافية" rows={3} />
          </Form.Item>

          <div className="flex justify-end space-x-2 space-x-reverse">
            <Button onClick={() => setShowModal(false)}>
              إلغاء
            </Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              {editId ? 'تحديث' : 'إضافة'}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default SalesCommissionsPage;
