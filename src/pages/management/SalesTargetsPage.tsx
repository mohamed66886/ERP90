import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Button, 
  Input, 
  Form, 
  Select, 
  Table, 
  Progress, 
  Space, 
  Modal, 
  message, 
  Row, 
  Col, 
  Statistic, 
  Typography,
  DatePicker,
  InputNumber,
  Tag,
  Tooltip,
  Empty
} from 'antd';
import { 
  AimOutlined,
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined,
  ExclamationCircleOutlined,
  TrophyOutlined,
  CalendarOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  BarChartOutlined,
  ArrowLeftOutlined,
  CrownOutlined,
  UserOutlined
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
const { RangePicker } = DatePicker;

interface SalesTarget {
  id?: string;
  representativeId: string;
  representativeName: string;
  targetType: 'monthly' | 'quarterly' | 'yearly';
  targetPeriod: string;
  targetAmount: number;
  achievedAmount?: number;
  actualProgress?: number;
  progressPercentage?: number;
  targetQuantity?: number;
  achievedQuantity?: number;
  status: 'pending' | 'in_progress' | 'achieved' | 'missed' | 'active' | 'completed' | 'expired';
  startDate: string;
  endDate: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface Representative {
  id: string;
  name: string;
  email: string;
  phone: string;
}

const SalesTargetsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const selectedRepFromURL = searchParams.get('rep');
  
  const [targets, setTargets] = useState<SalesTarget[]>([]);
  const [representatives, setRepresentatives] = useState<Representative[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [selectedRep, setSelectedRep] = useState<string>(selectedRepFromURL || 'all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'in_progress' | 'achieved' | 'missed'>('all');
  const [form] = Form.useForm();

  // Load targets and representatives
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

      // Load targets
      const targetsSnapshot = await getDocs(collection(db, "salesTargets"));
      const targetsData = targetsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as SalesTarget[];

      // Load sales data to calculate progress
      const salesSnapshot = await getDocs(collection(db, "sales_invoices"));
      const salesByRep: {[key: string]: number} = {};

      salesSnapshot.docs.forEach(doc => {
        const data = doc.data();
        const repId = data.delegate || data.representativeId;
        const total = data.totals?.total || 0;

        if (repId) {
          salesByRep[repId] = (salesByRep[repId] || 0) + total;
        }
      });

      // Update targets with actual progress and status
      const updatedTargets = targetsData.map(target => {
        const actualProgress = salesByRep[target.representativeId] || 0;
        const progressPercentage = (actualProgress / target.targetAmount) * 100;
        
        let status: 'pending' | 'in_progress' | 'achieved' | 'missed' = 'pending';
        
        const endDate = dayjs(target.endDate);
        const today = dayjs();
        
        if (progressPercentage >= 100) {
          status = 'achieved';
        } else if (today.isAfter(endDate)) {
          status = 'missed';
        } else if (actualProgress > 0) {
          status = 'in_progress';
        }

        return {
          ...target,
          actualProgress,
          progressPercentage: Math.min(progressPercentage, 100),
          status
        };
      });

      setTargets(updatedTargets);
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

  // Handle form submission
  const handleSubmit = async (values: SalesTarget) => {
    try {
      setLoading(true);
      const targetData = {
        ...values,
        achievedAmount: editId ? targets.find(t => t.id === editId)?.achievedAmount || 0 : 0,
        achievedQuantity: editId ? targets.find(t => t.id === editId)?.achievedQuantity || 0 : 0,
        representativeName: representatives.find(r => r.id === values.representativeId)?.name || '',
        createdAt: editId ? targets.find(t => t.id === editId)?.createdAt : new Date(),
        updatedAt: new Date(),
      };

      if (editId) {
        await updateDoc(doc(db, "salesTargets", editId), targetData);
        message.success('تم تحديث الهدف بنجاح');
      } else {
        await addDoc(collection(db, "salesTargets"), targetData);
        message.success('تم إضافة الهدف بنجاح');
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
  const handleEdit = (record: SalesTarget) => {
    setEditId(record.id || null);
    form.setFieldsValue({
      ...record,
      dateRange: [dayjs(record.startDate), dayjs(record.endDate)]
    });
    setShowModal(true);
  };

  // Handle delete
  const handleDelete = (id: string) => {
    confirm({
      title: 'هل أنت متأكد من حذف هذا الهدف؟',
      icon: <ExclamationCircleOutlined />,
      content: 'لا يمكن التراجع عن هذا الإجراء',
      okText: 'حذف',
      okType: 'danger',
      cancelText: 'إلغاء',
      async onOk() {
        try {
          await deleteDoc(doc(db, "salesTargets", id));
          message.success('تم حذف الهدف بنجاح');
          loadData();
        } catch (error) {
          message.error('حدث خطأ في حذف الهدف');
        }
      },
    });
  };

  // Calculate progress percentage
  const calculateProgress = (achieved: number, target: number) => {
    if (target === 0) return 0;
    return Math.round((achieved / target) * 100);
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'blue';
      case 'completed': return 'green';
      case 'expired': return 'red';
      default: return 'default';
    }
  };

  // Get status text
  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'نشط';
      case 'completed': return 'مكتمل';
      case 'expired': return 'منتهي';
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
      title: 'نوع الهدف',
      dataIndex: 'targetType',
      key: 'targetType',
      render: (type: string) => {
        const typeMap = {
          monthly: 'شهري',
          quarterly: 'ربع سنوي',
          yearly: 'سنوي'
        };
        return typeMap[type as keyof typeof typeMap] || type;
      },
    },
    {
      title: 'الفترة',
      dataIndex: 'targetPeriod',
      key: 'targetPeriod',
    },
    {
      title: 'هدف المبلغ',
      dataIndex: 'targetAmount',
      key: 'targetAmount',
      render: (amount: number) => `${amount.toLocaleString()} ج.م`,
    },
    {
      title: 'المبلغ المحقق',
      dataIndex: 'achievedAmount',
      key: 'achievedAmount',
      render: (amount: number) => `${amount.toLocaleString()} ج.م`,
    },
    {
      title: 'تقدم المبلغ',
      key: 'amountProgress',
      render: (_, record: SalesTarget) => {
        const progress = calculateProgress(record.achievedAmount, record.targetAmount);
        return (
          <Progress 
            percent={progress} 
            size="small"
            status={progress >= 100 ? 'success' : progress >= 75 ? 'normal' : 'exception'}
          />
        );
      },
    },
    {
      title: 'هدف الكمية',
      dataIndex: 'targetQuantity',
      key: 'targetQuantity',
    },
    {
      title: 'الكمية المحققة',
      dataIndex: 'achievedQuantity',
      key: 'achievedQuantity',
    },
    {
      title: 'تقدم الكمية',
      key: 'quantityProgress',
      render: (_, record: SalesTarget) => {
        const progress = calculateProgress(record.achievedQuantity, record.targetQuantity);
        return (
          <Progress 
            percent={progress} 
            size="small"
            status={progress >= 100 ? 'success' : progress >= 75 ? 'normal' : 'exception'}
          />
        );
      },
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
      title: 'الإجراءات',
      key: 'actions',
      render: (_, record: SalesTarget) => (
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
      title: 'إجمالي الأهداف',
      value: targets.length,
      prefix: <AimOutlined style={{ color: '#1890ff' }} />,
    },
    {
      title: 'الأهداف النشطة',
      value: targets.filter(t => t.status === 'active').length,
      prefix: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
    },
    {
      title: 'الأهداف المكتملة',
      value: targets.filter(t => t.status === 'completed').length,
      prefix: <TrophyOutlined style={{ color: '#faad14' }} />,
    },
    {
      title: 'متوسط الإنجاز',
      value: targets.length > 0 ? 
        Math.round(targets.reduce((acc, target) => 
          acc + calculateProgress(target.achievedAmount, target.targetAmount), 0) / targets.length) : 0,
      suffix: '%',
      prefix: <BarChartOutlined style={{ color: '#722ed1' }} />,
    },
  ];

  return (
    <div className="p-6" dir="rtl">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
        <div className="flex items-center justify-between">
          <div>
            <Title level={2} className="mb-0">أهداف المبيعات</Title>
            <Text type="secondary">تحديد ومتابعة أهداف المبيعات للمندوبين</Text>
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
              icon={<CrownOutlined />}
              onClick={() => navigate('/management/sales-commissions')}
            >
              العمولات
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
              إضافة هدف جديد
            </Button>
          </Space>
        </div>
      </div>

      <Breadcrumb
        items={[
          { label: "الرئيسية", to: "/" },
          { label: "إدارة المبيعات", to: "/management/sales" },
          { label: "أهداف المبيعات" }
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
                suffix={stat.suffix}
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
              <Option value="in_progress">قيد التنفيذ</Option>
              <Option value="achieved">تم تحقيقه</Option>
              <Option value="missed">لم يتحقق</Option>
            </Select>
          </Col>
        </Row>
      </Card>

      {/* Targets Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={targets.filter(target => {
            const matchesRep = selectedRep === 'all' || target.representativeId === selectedRep;
            const matchesStatus = statusFilter === 'all' || target.status === statusFilter;
            return matchesRep && matchesStatus;
          })}
          rowKey="id"
          loading={loading}
          pagination={{
            total: targets.filter(target => {
              const matchesRep = selectedRep === 'all' || target.representativeId === selectedRep;
              const matchesStatus = statusFilter === 'all' || target.status === statusFilter;
              return matchesRep && matchesStatus;
            }).length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} من ${total} هدف`,
          }}
        />
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        title={editId ? 'تعديل الهدف' : 'إضافة هدف جديد'}
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
                name="targetType"
                label="نوع الهدف"
                rules={[{ required: true, message: 'يرجى اختيار نوع الهدف' }]}
              >
                <Select placeholder="اختر نوع الهدف">
                  <Option value="monthly">شهري</Option>
                  <Option value="quarterly">ربع سنوي</Option>
                  <Option value="yearly">سنوي</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="targetPeriod"
                label="فترة الهدف"
                rules={[{ required: true, message: 'يرجى إدخال فترة الهدف' }]}
              >
                <Input placeholder="مثال: يناير 2024, Q1 2024, 2024" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="dateRange"
                label="تواريخ الهدف"
                rules={[{ required: true, message: 'يرجى اختيار تواريخ الهدف' }]}
              >
                <RangePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="targetAmount"
                label="هدف المبلغ (ج.م)"
                rules={[{ required: true, message: 'يرجى إدخال هدف المبلغ' }]}
              >
                <InputNumber 
                  style={{ width: '100%' }}
                  min={0}
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value!.replace(/\$\s?|(,*)/g, '')}
                  placeholder="هدف المبلغ"
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="targetQuantity"
                label="هدف الكمية"
                rules={[{ required: true, message: 'يرجى إدخال هدف الكمية' }]}
              >
                <InputNumber 
                  style={{ width: '100%' }}
                  min={0}
                  placeholder="هدف الكمية"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="status"
            label="الحالة"
            rules={[{ required: true, message: 'يرجى اختيار الحالة' }]}
          >
            <Select placeholder="اختر الحالة">
              <Option value="active">نشط</Option>
              <Option value="completed">مكتمل</Option>
              <Option value="expired">منتهي</Option>
            </Select>
          </Form.Item>

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

export default SalesTargetsPage;
