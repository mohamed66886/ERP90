import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Button, 
  Input, 
  Form, 
  Select, 
  Table, 
  Avatar, 
  Badge, 
  Space, 
  Modal, 
  message, 
  Row, 
  Col, 
  Statistic, 
  Typography,
  Tooltip,
  Switch,
  Empty,
  Spin,
  Divider,
  Upload,
  Tag,
  DatePicker
} from 'antd';
import { 
  UserOutlined, 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined,
  ExclamationCircleOutlined,
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  SearchOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  UploadOutlined,
  UserAddOutlined,
  TeamOutlined,
  CalendarOutlined,
  BankOutlined,
  DollarOutlined,
  TrophyOutlined,
  BarChartOutlined,
  EyeOutlined,
  StarOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
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

const { Title, Text } = Typography;
const { Option } = Select;
const { confirm } = Modal;
const { Search } = Input;

interface SalesRepresentative {
  id?: string;
  name: string;
  email: string;
  phone: string;
  branch: string;
  branchName?: string;
  department: string;
  position: string;
  hireDate: string;
  status: 'active' | 'inactive';
  avatar?: string;
  address?: string;
  notes?: string;
  commissionRate?: number;
  salary?: number;
  targetAmount?: number;
  currentSales?: number;
  uid?: string; // ربط بحساب المستخدم
  createdAt: Date;
  updatedAt: Date;
}

interface SalesData {
  representativeId: string;
  totalSales: number;
  targetsAchieved: number;
  commissionEarned: number;
}

const SalesRepresentativesPage: React.FC = () => {
  const navigate = useNavigate();
  const [representatives, setRepresentatives] = useState<SalesRepresentative[]>([]);
  const [branches, setBranches] = useState<{id: string, name: string}[]>([]);
  const [salesData, setSalesData] = useState<{[key: string]: SalesData}>({});
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [branchFilter, setBranchFilter] = useState<string>('all');
  const [form] = Form.useForm();

  // Load branches
  const loadBranches = async () => {
    try {
      const branchesSnapshot = await getDocs(collection(db, "branches"));
      const branchesData = branchesSnapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name || doc.data().nameAr || 'فرع غير محدد'
      }));
      setBranches(branchesData);
    } catch (error) {
      console.error('Error loading branches:', error);
    }
  };

  // Load sales data for each representative
  const loadSalesData = async () => {
    try {
      const salesSnapshot = await getDocs(collection(db, "sales_invoices"));
      const commissionsSnapshot = await getDocs(collection(db, "salesCommissions"));
      
      const salesByRep: {[key: string]: SalesData} = {};
      
      // حساب المبيعات
      salesSnapshot.docs.forEach(doc => {
        const data = doc.data();
        const repId = data.delegate || data.representativeId;
        if (repId) {
          if (!salesByRep[repId]) {
            salesByRep[repId] = {
              representativeId: repId,
              totalSales: 0,
              targetsAchieved: 0,
              commissionEarned: 0
            };
          }
          salesByRep[repId].totalSales += data.totals?.total || 0;
        }
      });

      // حساب العمولات
      commissionsSnapshot.docs.forEach(doc => {
        const data = doc.data();
        const repId = data.representativeId;
        if (repId && salesByRep[repId]) {
          salesByRep[repId].commissionEarned += data.finalAmount || 0;
        }
      });

      setSalesData(salesByRep);
    } catch (error) {
      console.error('Error loading sales data:', error);
    }
  };

  // Load representatives
  const loadRepresentatives = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "salesRepresentatives"));
      const repsData = querySnapshot.docs.map(doc => {
        const data = doc.data();
        const branch = branches.find(b => b.id === data.branch);
        return {
          id: doc.id,
          ...data,
          branchName: branch?.name || 'فرع غير محدد',
          currentSales: salesData[doc.id]?.totalSales || 0
        } as SalesRepresentative;
      });
      setRepresentatives(repsData);
    } catch (error) {
      message.error('حدث خطأ في تحميل بيانات المندوبين');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBranches();
  }, []);

  useEffect(() => {
    if (branches.length > 0) {
      loadSalesData();
    }
  }, [branches]);

  useEffect(() => {
    if (branches.length > 0) {
      loadRepresentatives();
    }
  }, [branches, salesData]);

  // Handle form submission
  const handleSubmit = async (values: Partial<SalesRepresentative>) => {
    try {
      setLoading(true);
      const repData = {
        ...values,
        hireDate: values.hireDate ? dayjs(values.hireDate).format('YYYY-MM-DD') : '',
        createdAt: editId ? representatives.find(r => r.id === editId)?.createdAt : new Date(),
        updatedAt: new Date(),
      };

      if (editId) {
        await updateDoc(doc(db, "salesRepresentatives", editId), repData);
        message.success('تم تحديث بيانات المندوب بنجاح');
      } else {
        await addDoc(collection(db, "salesRepresentatives"), repData);
        message.success('تم إضافة المندوب بنجاح');
      }

      setShowModal(false);
      setEditId(null);
      form.resetFields();
      loadRepresentatives();
    } catch (error) {
      message.error('حدث خطأ في حفظ البيانات');
    } finally {
      setLoading(false);
    }
  };

  // Handle edit
  const handleEdit = (record: SalesRepresentative) => {
    setEditId(record.id || null);
    form.setFieldsValue({
      ...record,
      hireDate: record.hireDate ? dayjs(record.hireDate) : null
    });
    setShowModal(true);
  };

  // Handle delete
  const handleDelete = (id: string) => {
    confirm({
      title: 'هل أنت متأكد من حذف هذا المندوب؟',
      icon: <ExclamationCircleOutlined />,
      content: 'لا يمكن التراجع عن هذا الإجراء',
      okText: 'حذف',
      okType: 'danger',
      cancelText: 'إلغاء',
      async onOk() {
        try {
          await deleteDoc(doc(db, "salesRepresentatives", id));
          message.success('تم حذف المندوب بنجاح');
          loadRepresentatives();
        } catch (error) {
          message.error('حدث خطأ في حذف المندوب');
        }
      },
    });
  };

  // Navigate to performance evaluation
  const handleViewPerformance = (repId: string) => {
    navigate(`/management/performance-evaluation?rep=${repId}`);
  };

  // Navigate to commissions
  const handleViewCommissions = (repId: string) => {
    navigate(`/management/sales-commissions?rep=${repId}`);
  };

  // Navigate to targets
  const handleViewTargets = (repId: string) => {
    navigate(`/management/sales-targets?rep=${repId}`);
  };

  // Filtered representatives
  const filteredRepresentatives = representatives.filter(rep => {
    const matchesSearch = rep.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rep.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rep.phone.includes(searchTerm);
    
    const matchesStatus = statusFilter === 'all' || rep.status === statusFilter;
    const matchesBranch = branchFilter === 'all' || rep.branch === branchFilter;
    
    return matchesSearch && matchesStatus && matchesBranch;
  });

  // Table columns
  const columns = [
    {
      title: 'المندوب',
      key: 'representative',
      render: (_, record: SalesRepresentative) => (
        <Space>
          <Avatar 
            size={40} 
            src={record.avatar} 
            icon={<UserOutlined />}
          >
            {!record.avatar && record.name.charAt(0)}
          </Avatar>
          <div>
            <Text strong>{record.name}</Text>
            <br />
            <Text type="secondary">{record.position}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'معلومات الاتصال',
      key: 'contact',
      render: (_, record: SalesRepresentative) => (
        <div>
          <Space>
            <MailOutlined />
            <Text copyable>{record.email}</Text>
          </Space>
          <br />
          <Space>
            <PhoneOutlined />
            <Text copyable>{record.phone}</Text>
          </Space>
        </div>
      ),
    },
    {
      title: 'الفرع والقسم',
      key: 'department',
      render: (_, record: SalesRepresentative) => (
        <div>
          <Tag color="blue">{record.branchName}</Tag>
          <br />
          <Text type="secondary">{record.department}</Text>
        </div>
      ),
    },
    {
      title: 'إجمالي المبيعات',
      key: 'totalSales',
      render: (_, record: SalesRepresentative) => {
        const sales = salesData[record.id || '']?.totalSales || 0;
        return (
          <Space>
            <DollarOutlined style={{ color: '#52c41a' }} />
            <Text strong>{sales.toLocaleString()} ج.م</Text>
          </Space>
        );
      },
      sorter: (a: SalesRepresentative, b: SalesRepresentative) => 
        (salesData[a.id || '']?.totalSales || 0) - (salesData[b.id || '']?.totalSales || 0),
    },
    {
      title: 'العمولة المكتسبة',
      key: 'commission',
      render: (_, record: SalesRepresentative) => {
        const commission = salesData[record.id || '']?.commissionEarned || 0;
        return (
          <Space>
            <StarOutlined style={{ color: '#faad14' }} />
            <Text>{commission.toLocaleString()} ج.م</Text>
          </Space>
        );
      },
    },
    {
      title: 'تاريخ التوظيف',
      dataIndex: 'hireDate',
      key: 'hireDate',
      render: (date: string) => date ? dayjs(date).format('YYYY-MM-DD') : '-',
    },
    {
      title: 'الحالة',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Badge 
          status={status === 'active' ? 'success' : 'error'} 
          text={status === 'active' ? 'نشط' : 'غير نشط'}
        />
      ),
    },
    {
      title: 'الإجراءات',
      key: 'actions',
      render: (_, record: SalesRepresentative) => (
        <Space>
          <Tooltip title="عرض الأداء">
            <Button 
              type="text" 
              icon={<BarChartOutlined />} 
              onClick={() => handleViewPerformance(record.id!)}
            />
          </Tooltip>
          <Tooltip title="عرض العمولات">
            <Button 
              type="text" 
              icon={<DollarOutlined />} 
              onClick={() => handleViewCommissions(record.id!)}
            />
          </Tooltip>
          <Tooltip title="عرض الأهداف">
            <Button 
              type="text" 
              icon={<TrophyOutlined />} 
              onClick={() => handleViewTargets(record.id!)}
            />
          </Tooltip>
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
      title: 'إجمالي المندوبين',
      value: representatives.length,
      prefix: <TeamOutlined style={{ color: '#1890ff' }} />,
    },
    {
      title: 'المندوبين النشطين',
      value: representatives.filter(r => r.status === 'active').length,
      prefix: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
    },
    {
      title: 'إجمالي المبيعات',
      value: Object.values(salesData).reduce((sum, data) => sum + data.totalSales, 0),
      prefix: <DollarOutlined style={{ color: '#722ed1' }} />,
      formatter: (value: number) => `${value.toLocaleString()} ج.م`,
    },
    {
      title: 'إجمالي العمولات',
      value: Object.values(salesData).reduce((sum, data) => sum + data.commissionEarned, 0),
      prefix: <StarOutlined style={{ color: '#faad14' }} />,
      formatter: (value: number) => `${value.toLocaleString()} ج.م`,
    },
  ];

  return (
    <div className="p-6" dir="rtl">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
        <div className="flex items-center justify-between">
          <div>
            <Title level={2} className="mb-0">إدارة المندوبين</Title>
            <Text type="secondary">إدارة فريق المبيعات والمندوبين</Text>
          </div>
          <Space>
            <Button 
              icon={<BarChartOutlined />}
              onClick={() => navigate('/management/performance-evaluation')}
            >
              تقييم الأداء
            </Button>
            <Button 
              icon={<DollarOutlined />}
              onClick={() => navigate('/management/sales-commissions')}
            >
              العمولات
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
              إضافة مندوب جديد
            </Button>
          </Space>
        </div>
      </div>

      <Breadcrumb
        items={[
          { label: "الرئيسية", to: "/" },
          { label: "إدارة المبيعات", to: "/management/sales" },
          { label: "إدارة المندوبين" }
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

      {/* Search and Filters */}
      <Card className="mb-6">
        <Row gutter={16} align="middle">
          <Col xs={24} sm={8}>
            <Search
              placeholder="البحث في المندوبين..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} sm={6}>
            <Select
              style={{ width: '100%' }}
              placeholder="فلترة حسب الحالة"
              value={statusFilter}
              onChange={setStatusFilter}
            >
              <Option value="all">جميع الحالات</Option>
              <Option value="active">نشط</Option>
              <Option value="inactive">غير نشط</Option>
            </Select>
          </Col>
          <Col xs={24} sm={6}>
            <Select
              style={{ width: '100%' }}
              placeholder="فلترة حسب الفرع"
              value={branchFilter}
              onChange={setBranchFilter}
            >
              <Option value="all">جميع الفروع</Option>
              {branches.map(branch => (
                <Option key={branch.id} value={branch.id}>{branch.name}</Option>
              ))}
            </Select>
          </Col>
        </Row>
      </Card>

      {/* Representatives Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredRepresentatives}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1200 }}
          pagination={{
            total: filteredRepresentatives.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} من ${total} مندوب`,
          }}
        />
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        title={editId ? 'تعديل المندوب' : 'إضافة مندوب جديد'}
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
                name="name"
                label="اسم المندوب"
                rules={[{ required: true, message: 'يرجى إدخال اسم المندوب' }]}
              >
                <Input placeholder="اسم المندوب" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="email"
                label="البريد الإلكتروني"
                rules={[
                  { required: true, message: 'يرجى إدخال البريد الإلكتروني' },
                  { type: 'email', message: 'يرجى إدخال بريد إلكتروني صحيح' }
                ]}
              >
                <Input placeholder="البريد الإلكتروني" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="phone"
                label="رقم الهاتف"
                rules={[{ required: true, message: 'يرجى إدخال رقم الهاتف' }]}
              >
                <Input placeholder="رقم الهاتف" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="branch"
                label="الفرع"
                rules={[{ required: true, message: 'يرجى اختيار الفرع' }]}
              >
                <Select placeholder="اختر الفرع">
                  {branches.map(branch => (
                    <Option key={branch.id} value={branch.id}>{branch.name}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="department"
                label="القسم"
                rules={[{ required: true, message: 'يرجى إدخال القسم' }]}
              >
                <Select placeholder="اختر القسم">
                  <Option value="المبيعات">المبيعات</Option>
                  <Option value="التسويق">التسويق</Option>
                  <Option value="خدمة العملاء">خدمة العملاء</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="position"
                label="المنصب"
                rules={[{ required: true, message: 'يرجى إدخال المنصب' }]}
              >
                <Input placeholder="المنصب" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="hireDate"
                label="تاريخ التوظيف"
                rules={[{ required: true, message: 'يرجى اختيار تاريخ التوظيف' }]}
              >
                <DatePicker 
                  style={{ width: '100%' }}
                  placeholder="تاريخ التوظيف"
                  format="YYYY-MM-DD"
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="status"
                label="الحالة"
                rules={[{ required: true, message: 'يرجى اختيار الحالة' }]}
              >
                <Select placeholder="اختر الحالة">
                  <Option value="active">نشط</Option>
                  <Option value="inactive">غير نشط</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="commissionRate"
                label="نسبة العمولة (%)"
              >
                <Input type="number" placeholder="نسبة العمولة" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="salary"
                label="الراتب الأساسي"
              >
                <Input type="number" placeholder="الراتب الأساسي" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="address" label="العنوان">
            <Input.TextArea placeholder="العنوان" rows={2} />
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

export default SalesRepresentativesPage;
