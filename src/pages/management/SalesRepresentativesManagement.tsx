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
  Divider,
  Typography,
  Tooltip,
  Switch,
  Empty,
  Spin
} from 'antd';
import { 
  UserOutlined, 
  PlusOutlined, 
  EyeOutlined, 
  EyeInvisibleOutlined, 
  EditOutlined, 
  DeleteOutlined,
  ExclamationCircleOutlined,
  UsergroupAddOutlined,
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  SearchOutlined,
  FilterOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';
import Breadcrumb from "@/components/Breadcrumb";
import { db, auth } from "@/lib/firebase";
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  setDoc
} from "firebase/firestore";
import { createUserWithEmailAndPassword, getAuth } from "firebase/auth";
import { getApps, initializeApp } from "firebase/app";
import { fetchBranches, Branch } from "@/lib/branches";
import { initializeSampleBranches } from "@/utils/initializeBranches";

const { Title } = Typography;
const { Option } = Select;
const { confirm } = Modal;

interface FormValues {
  name: string;
  email: string;
  phone: string;
  branch: string;
  password?: string;
  avatar?: string;
  status: 'active' | 'inactive';
}

interface SalesRepresentative {
  id?: string;
  name: string;
  email: string;
  phone: string;
  branch: string;
  password: string;
  avatar?: string;
  status: 'active' | 'inactive';
  createdAt: Date;
}

const SalesRepresentativesManagement: React.FC = () => {
  const [representatives, setRepresentatives] = useState<SalesRepresentative[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBranch, setFilterBranch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [form] = Form.useForm();

  // Load data on component mount
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      try {
        // Load representatives
        const repsSnapshot = await getDocs(collection(db, 'sales_representatives'));
        const repsData = repsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date()
        })) as SalesRepresentative[];
        setRepresentatives(repsData);

        // Load branches
        const branchesData = await fetchBranches();
        if (branchesData.length === 0) {
          await initializeSampleBranches();
          const newBranchesData = await fetchBranches();
          setBranches(newBranchesData);
        } else {
          setBranches(branchesData);
        }
      } catch (error) {
        console.error('Error loading data:', error);
        message.error("حدث خطأ أثناء تحميل بيانات المندوبين");
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const repsSnapshot = await getDocs(collection(db, 'sales_representatives'));
      const repsData = repsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      })) as SalesRepresentative[];
      setRepresentatives(repsData);

      const branchesData = await fetchBranches();
      if (branchesData.length === 0) {
        await initializeSampleBranches();
        const newBranchesData = await fetchBranches();
        setBranches(newBranchesData);
      } else {
        setBranches(branchesData);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      message.error("حدث خطأ أثناء تحميل بيانات المندوبين");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: FormValues) => {
    setLoading(true);
    try {
      if (editId) {
        const repRef = doc(db, 'sales_representatives', editId);
        const updateData: Partial<SalesRepresentative> = {
          name: values.name,
          email: values.email,
          phone: values.phone,
          branch: values.branch,
          avatar: values.avatar || '',
          status: values.status
        };
        
        await updateDoc(repRef, updateData);
        message.success("تم تحديث بيانات المندوب بنجاح");
      } else {
        let secondaryApp;
        const existingApps = getApps();
        const secondaryAppName = 'secondaryApp';
        
        if (existingApps.find(app => app.name === secondaryAppName)) {
          secondaryApp = existingApps.find(app => app.name === secondaryAppName);
        } else {
          const currentApp = existingApps[0];
          secondaryApp = initializeApp(currentApp.options, secondaryAppName);
        }
        
        const secondaryAuth = getAuth(secondaryApp);
        const userCredential = await createUserWithEmailAndPassword(secondaryAuth, values.email, values.password);
        const firebaseUser = userCredential.user;

        await secondaryAuth.signOut();

        const newRep: Omit<SalesRepresentative, 'id'> = {
          name: values.name,
          email: values.email,
          phone: values.phone,
          branch: values.branch,
          password: values.password,
          avatar: values.avatar || '',
          status: values.status || 'active',
          createdAt: new Date()
        };

        await addDoc(collection(db, 'sales_representatives'), {
          ...newRep,
          uid: firebaseUser.uid
        });

        await setDoc(doc(db, 'users', firebaseUser.uid), {
          uid: firebaseUser.uid,
          name: values.name,
          email: values.email,
          avatar: values.avatar || '',
          role: 'sales_representative',
          branch: values.branch,
          phone: values.phone,
          status: values.status || 'active'
        });

        message.success("تم إضافة المندوب الجديد بنجاح");
      }

      form.resetFields();
      setShowForm(false);
      setEditId(null);
      await loadData();

    } catch (error: unknown) {
      console.error('Error saving representative:', error);
      let errorMessage = "حدث خطأ أثناء حفظ البيانات";
      
      if (error && typeof error === 'object' && 'code' in error) {
        const firebaseError = error as { code: string };
        if (firebaseError.code === 'auth/email-already-in-use') {
          errorMessage = "البريد الإلكتروني مستخدم بالفعل";
        } else if (firebaseError.code === 'auth/weak-password') {
          errorMessage = "كلمة المرور ضعيفة جداً";
        }
      }
      
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (rep: SalesRepresentative) => {
    form.setFieldsValue({
      name: rep.name,
      email: rep.email,
      phone: rep.phone,
      branch: rep.branch,
      avatar: rep.avatar || '',
      status: rep.status
    });
    setEditId(rep.id!);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    confirm({
      title: 'هل أنت متأكد من حذف هذا المندوب؟',
      icon: <ExclamationCircleOutlined />,
      content: 'لا يمكن التراجع عن هذا الإجراء',
      okText: 'نعم، احذف',
      cancelText: 'إلغاء',
      okType: 'danger',
      onOk: async () => {
        setLoading(true);
        try {
          await deleteDoc(doc(db, 'sales_representatives', id));
          message.success("تم حذف المندوب بنجاح");
          await loadData();
        } catch (error) {
          console.error('Error deleting representative:', error);
          message.error("حدث خطأ أثناء حذف المندوب");
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const toggleStatus = async (id: string, currentStatus: 'active' | 'inactive') => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    
    setLoading(true);
    try {
      await updateDoc(doc(db, 'sales_representatives', id), {
        status: newStatus
      });
      
      message.success(`تم ${newStatus === 'active' ? 'تفعيل' : 'إلغاء تفعيل'} المندوب`);
      await loadData();
    } catch (error) {
      console.error('Error updating status:', error);
      message.error("حدث خطأ أثناء تحديث حالة المندوب");
    } finally {
      setLoading(false);
    }
  };

  const filteredRepresentatives = representatives.filter(rep => {
    const matchesSearch = rep.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         rep.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         rep.phone.includes(searchTerm);
    
    const matchesBranch = !filterBranch || rep.branch === filterBranch;
    const matchesStatus = !filterStatus || rep.status === filterStatus;
    
    return matchesSearch && matchesBranch && matchesStatus;
  });

  const getBranchName = (branchId: string) => {
    const branch = branches.find(b => b.id === branchId);
    return branch ? branch.name : branchId;
  };

  const columns = [
    {
      title: 'المندوب',
      key: 'representative',
      render: (_: unknown, record: SalesRepresentative) => (
        <Space>
          <Avatar 
            size={48} 
            src={record.avatar} 
            icon={<UserOutlined />}
            style={{ backgroundColor: '#9333ea' }}
          >
            {record.name.split(' ').map(n => n[0]).join('')}
          </Avatar>
          <div>
            <div style={{ fontWeight: 500 }}>{record.name}</div>
            <div style={{ color: '#666', fontSize: '12px' }}>
              انضم في {record.createdAt.toLocaleDateString('ar-SA')}
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: 'معلومات الاتصال',
      key: 'contact',
      render: (_: unknown, record: SalesRepresentative) => (
        <div>
          <div style={{ marginBottom: 4 }}>
            <MailOutlined style={{ marginLeft: 8, color: '#666' }} />
            {record.email}
          </div>
          <div>
            <PhoneOutlined style={{ marginLeft: 8, color: '#666' }} />
            {record.phone}
          </div>
        </div>
      ),
    },
    {
      title: 'الفرع',
      key: 'branch',
      align: 'center' as const,
      render: (_: unknown, record: SalesRepresentative) => (
        <Badge count={getBranchName(record.branch)} color="blue" />
      ),
    },
    {
      title: 'الحالة',
      key: 'status',
      align: 'center' as const,
      render: (_: unknown, record: SalesRepresentative) => (
        <Switch
          checked={record.status === 'active'}
          onChange={() => toggleStatus(record.id!, record.status)}
          checkedChildren="نشط"
          unCheckedChildren="غير نشط"
          loading={loading}
        />
      ),
    },
    {
      title: 'الإجراءات',
      key: 'actions',
      align: 'center' as const,
      render: (_: unknown, record: SalesRepresentative) => (
        <Space>
          <Tooltip title="تعديل">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
              style={{ color: '#1890ff' }}
            />
          </Tooltip>
          <Tooltip title="حذف">
            <Button
              type="text"
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record.id!)}
              style={{ color: '#ff4d4f' }}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24, minHeight: '100vh', direction: 'rtl' }}>
      {/* Header */}
      <Card style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <UsergroupAddOutlined style={{ fontSize: 32, color: '#9333ea', marginLeft: 16 }} />
            <div>
              <Title level={2} style={{ margin: 0, color: '#1f2937' }}>إدارة المندوبين</Title>
              <p style={{ margin: '8px 0 0 0', color: '#6b7280' }}>إدارة فريق المبيعات والمندوبين</p>
            </div>
          </div>
          <Button 
            type="primary"
            icon={<PlusOutlined />}
            size="large"
            onClick={() => {
              setShowForm(true);
              form.resetFields();
              setEditId(null);
            }}
            style={{ backgroundColor: '#9333ea', borderColor: '#9333ea' }}
          >
            إضافة مندوب جديد
          </Button>
        </div>
      </Card>

      <Breadcrumb
        items={[
          { label: "الرئيسية", to: "/" },
          { label: "إدارة المبيعات", to: "/management/sales" },
          { label: "إدارة المندوبين" }, 
        ]}
      />

      {/* Statistics Cards */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="إجمالي المندوبين"
              value={representatives.length}
              prefix={<UsergroupAddOutlined style={{ color: '#9333ea' }} />}
              valueStyle={{ color: '#9333ea' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="مندوبين نشطين"
              value={representatives.filter(rep => rep.status === 'active').length}
              prefix={<CheckCircleOutlined style={{ color: '#10b981' }} />}
              valueStyle={{ color: '#10b981' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="مندوبين غير نشطين"
              value={representatives.filter(rep => rep.status === 'inactive').length}
              prefix={<CloseCircleOutlined style={{ color: '#ef4444' }} />}
              valueStyle={{ color: '#ef4444' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="عدد الفروع"
              value={branches.length}
              prefix={<EnvironmentOutlined style={{ color: '#3b82f6' }} />}
              valueStyle={{ color: '#3b82f6' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Add/Edit Form Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <UsergroupAddOutlined style={{ marginLeft: 8, color: '#9333ea' }} />
            {editId ? 'تعديل بيانات المندوب' : 'إضافة مندوب جديد'}
          </div>
        }
        open={showForm}
        onCancel={() => {
          setShowForm(false);
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
          initialValues={{ status: 'active' }}
        >
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                label="الاسم الكامل"
                name="name"
                rules={[
                  { required: true, message: 'الاسم مطلوب' },
                  { min: 2, message: 'الاسم يجب أن يكون حرفين على الأقل' }
                ]}
              >
                <Input placeholder="أدخل الاسم الكامل" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label="البريد الإلكتروني"
                name="email"
                rules={[
                  { required: true, message: 'البريد الإلكتروني مطلوب' },
                  { type: 'email', message: 'البريد الإلكتروني غير صالح' }
                ]}
              >
                <Input placeholder="example@company.com" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label="رقم الهاتف"
                name="phone"
                rules={[
                  { required: true, message: 'رقم الهاتف مطلوب' },
                  { pattern: /^05\d{8}$/, message: 'رقم الهاتف يجب أن يبدأ بـ 05 ويتكون من 10 أرقام' }
                ]}
              >
                <Input placeholder="05xxxxxxxx" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label="الفرع"
                name="branch"
                rules={[{ required: true, message: 'الفرع مطلوب' }]}
              >
                <Select placeholder="اختر الفرع">
                  {branches.map(branch => (
                    <Option key={branch.id} value={branch.id}>
                      {branch.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            {!editId && (
              <Col xs={24} md={12}>
                <Form.Item
                  label="كلمة المرور"
                  name="password"
                  rules={[
                    { required: true, message: 'كلمة المرور مطلوبة' },
                    { min: 6, message: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' }
                  ]}
                >
                  <Input.Password 
                    placeholder="أدخل كلمة مرور قوية"
                    iconRender={(visible) => (visible ? <EyeOutlined /> : <EyeInvisibleOutlined />)}
                  />
                </Form.Item>
              </Col>
            )}
            <Col xs={24} md={12}>
              <Form.Item
                label="رابط الصورة الشخصية"
                name="avatar"
              >
                <Input placeholder="https://example.com/avatar.jpg" />
              </Form.Item>
            </Col>
            {editId && (
              <Col xs={24} md={12}>
                <Form.Item
                  label="الحالة"
                  name="status"
                >
                  <Select>
                    <Option value="active">نشط</Option>
                    <Option value="inactive">غير نشط</Option>
                  </Select>
                </Form.Item>
              </Col>
            )}
          </Row>
          
          <Divider />
          
          <div style={{ textAlign: 'left' }}>
            <Space>
              <Button onClick={() => {
                setShowForm(false);
                setEditId(null);
                form.resetFields();
              }}>
                إلغاء
              </Button>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loading}
                style={{ backgroundColor: '#9333ea', borderColor: '#9333ea' }}
              >
                {editId ? 'تحديث البيانات' : 'حفظ المندوب'}
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>

      {/* Search and Filters */}
      <Card style={{ marginBottom: 24 }}>
        <Title level={4}>
          <SearchOutlined style={{ marginLeft: 8 }} />
          البحث والتصفية
        </Title>
        <Row gutter={16}>
          <Col xs={24} md={8}>
            <Input
              placeholder="ابحث بالاسم، الإيميل، أو رقم الهاتف"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              prefix={<SearchOutlined />}
            />
          </Col>
          <Col xs={24} md={8}>
            <Select
              placeholder="تصفية حسب الفرع"
              value={filterBranch}
              onChange={setFilterBranch}
              style={{ width: '100%' }}
              allowClear
            >
              {branches.map(branch => (
                <Option key={branch.id} value={branch.id}>
                  {branch.name}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} md={8}>
            <Select
              placeholder="تصفية حسب الحالة"
              value={filterStatus}
              onChange={setFilterStatus}
              style={{ width: '100%' }}
              allowClear
            >
              <Option value="active">نشط</Option>
              <Option value="inactive">غير نشط</Option>
            </Select>
          </Col>
        </Row>
      </Card>

      {/* Representatives Table */}
      <Card>
        <Title level={4}>
          <UsergroupAddOutlined style={{ marginLeft: 8 }} />
          قائمة المندوبين ({filteredRepresentatives.length})
        </Title>
        
        <Spin spinning={loading}>
          {filteredRepresentatives.length === 0 ? (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                searchTerm || filterBranch || filterStatus 
                  ? "لم يتم العثور على نتائج مطابقة للبحث"
                  : "لم يتم إضافة أي مندوبين بعد"
              }
            >
              {!searchTerm && !filterBranch && !filterStatus && (
                <Button 
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => {
                    setShowForm(true);
                    form.resetFields();
                    setEditId(null);
                  }}
                  style={{ backgroundColor: '#9333ea', borderColor: '#9333ea' }}
                >
                  إضافة أول مندوب
                </Button>
              )}
            </Empty>
          ) : (
            <Table
              columns={columns}
              dataSource={filteredRepresentatives}
              rowKey="id"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => 
                  `${range[0]}-${range[1]} من ${total} مندوب`,
              }}
              scroll={{ x: 800 }}
            />
          )}
        </Spin>
      </Card>
    </div>
  );
};

export default SalesRepresentativesManagement;