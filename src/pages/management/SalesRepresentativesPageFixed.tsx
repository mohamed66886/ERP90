import React, { useState, useEffect, useCallback } from 'react';
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
  StarOutlined,
  EyeInvisibleOutlined,
  LockOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import Breadcrumb from "@/components/Breadcrumb";
import { db } from "@/lib/firebase";
import "@/styles/salesRepAvatar.css";
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
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { auth, storage } from "@/lib/firebase";

const { Title, Text } = Typography;
const { Option } = Select;
const { confirm } = Modal;
const { Search } = Input;

interface SalesRepresentative {
  id?: string;
  name: string;
  email: string;
  password?: string; // إضافة حقل كلمة المرور
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
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordValue, setPasswordValue] = useState('');

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
  const loadRepresentatives = useCallback(async () => {
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
  }, [branches, salesData]);

  // Convert image to Base64 (fallback method)
  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  // Upload image to Firebase Storage
  const uploadImage = async (file: File): Promise<string> => {
    try {
      // استخدام timestamp أبسط وتنظيف اسم الملف
      const timestamp = Date.now();
      const fileExtension = file.name.split('.').pop() || 'jpg';
      const cleanFileName = `sales-rep-${timestamp}.${fileExtension}`;
      const imageRef = ref(storage, `sales-reps/${cleanFileName}`);
      
      // رفع الملف مع metadata
      const metadata = {
        contentType: file.type || 'image/jpeg',
        customMetadata: {
          uploadedBy: 'sales-rep-management',
          originalName: file.name
        }
      };
      
      console.log('Uploading file:', cleanFileName, 'Size:', file.size);
      
      const uploadResult = await uploadBytes(imageRef, file, metadata);
      console.log('Upload successful:', uploadResult);
      
      const downloadURL = await getDownloadURL(uploadResult.ref);
      console.log('Download URL obtained:', downloadURL);
      
      return downloadURL;
    } catch (error) {
      console.error('Error uploading image to Firebase Storage:', error);
      
      // تحسين رسائل الخطأ
      if (error && typeof error === 'object' && 'code' in error) {
        const firebaseError = error as { code: string; message: string };
        console.error('Firebase error code:', firebaseError.code);
        console.error('Firebase error message:', firebaseError.message);
        
        // إذا كانت المشكلة CORS أو unauthorized، استخدم Base64 كحل بديل
        if (firebaseError.code === 'storage/unauthorized' || 
            firebaseError.message.includes('CORS') ||
            firebaseError.message.includes('Access to XMLHttpRequest')) {
          console.log('Falling back to Base64 storage due to CORS/Auth issues');
          try {
            const base64 = await convertToBase64(file);
            message.warning('تم حفظ الصورة محلياً بسبب مشكلة في الخادم');
            return base64;
          } catch (base64Error) {
            console.error('Base64 conversion failed:', base64Error);
            throw new Error('فشل في معالجة الصورة.');
          }
        }
        
        switch (firebaseError.code) {
          case 'storage/unauthorized':
            throw new Error('غير مخول لرفع الصور. يرجى التحقق من صلاحياتك.');
          case 'storage/canceled':
            throw new Error('تم إلغاء رفع الصورة.');
          case 'storage/quota-exceeded':
            throw new Error('تم تجاوز حد التخزين المسموح.');
          case 'storage/invalid-format':
            throw new Error('تنسيق الصورة غير مدعوم.');
          case 'storage/invalid-argument':
            throw new Error('خطأ في معاملات رفع الصورة.');
          default:
            // إذا فشل Firebase Storage، جرب Base64 كحل بديل
            try {
              const base64 = await convertToBase64(file);
              message.warning('تم حفظ الصورة محلياً بسبب خطأ في الخادم');
              return base64;
            } catch (base64Error) {
              throw new Error(`خطأ في رفع الصورة: ${firebaseError.message}`);
            }
        }
      }
      
      // كحل أخير، جرب Base64
      try {
        const base64 = await convertToBase64(file);
        message.warning('تم حفظ الصورة محلياً');
        return base64;
      } catch (base64Error) {
        throw new Error('فشل في رفع الصورة. يرجى المحاولة مرة أخرى.');
      }
    }
  };

  // Create user account in Firebase Auth
  const createUserAccount = async (email: string, password: string, displayName: string, photoURL?: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, {
        displayName,
        photoURL
      });
      return userCredential.user.uid;
    } catch (error: unknown) {
      console.error('Error creating user account:', error);
      let errorMessage = 'فشل في إنشاء حساب المستخدم';
      
      if (error && typeof error === 'object' && 'code' in error) {
        const firebaseError = error as { code: string };
        switch (firebaseError.code) {
          case 'auth/email-already-in-use':
            errorMessage = 'البريد الإلكتروني مستخدم بالفعل';
            break;
          case 'auth/weak-password':
            errorMessage = 'كلمة المرور ضعيفة جداً';
            break;
          case 'auth/invalid-email':
            errorMessage = 'البريد الإلكتروني غير صالح';
            break;
        }
      }
      
      throw new Error(errorMessage);
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
  }, [branches, salesData, loadRepresentatives]);

  // Handle form submission
  const handleSubmit = async (values: Partial<SalesRepresentative>) => {
    try {
      setLoading(true);
      
      let avatarURL = values.avatar;
      let userUID = values.uid;
      
      // Upload image if new file is selected
      if (imageFile) {
        try {
          setUploadingImage(true);
          avatarURL = await uploadImage(imageFile);
          setUploadingImage(false);
          message.success('تم رفع الصورة بنجاح');
        } catch (error) {
          setUploadingImage(false);
          message.error((error as Error).message);
          return;
        }
      }
      
      // Create user account for new representative
      if (!editId && values.email && values.password) {
        try {
          userUID = await createUserAccount(
            values.email,
            values.password,
            values.name || '',
            avatarURL
          );
          message.success('تم إنشاء حساب المستخدم بنجاح');
        } catch (error) {
          message.error((error as Error).message);
          return;
        }
      }
      
      const repData = {
        ...values,
        avatar: avatarURL,
        uid: userUID,
        hireDate: values.hireDate ? dayjs(values.hireDate).format('YYYY-MM-DD') : '',
        createdAt: editId ? representatives.find(r => r.id === editId)?.createdAt : new Date(),
        updatedAt: new Date(),
      };
      
      // Remove password from saved data (it's only used for account creation)
      delete repData.password;
      if ('confirmPassword' in repData) {
        delete (repData as Record<string, unknown>).confirmPassword;
      }

      if (editId) {
        await updateDoc(doc(db, "salesRepresentatives", editId), repData);
        message.success('تم تحديث بيانات المندوب بنجاح');
      } else {
        await addDoc(collection(db, "salesRepresentatives"), repData);
        message.success('تم إضافة المندوب بنجاح');
      }

      setShowModal(false);
      setEditId(null);
      setImageFile(null);
      setPasswordValue('');
      form.resetFields();
      loadRepresentatives();
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      message.error('حدث خطأ في حفظ البيانات');
    } finally {
      setLoading(false);
      setUploadingImage(false);
    }
  };

  // Handle edit
  const handleEdit = (record: SalesRepresentative) => {
    setEditId(record.id || null);
    setImageFile(null); // Reset image file
    setPasswordValue(''); // Reset password
    form.setFieldsValue({
      ...record,
      hireDate: record.hireDate ? dayjs(record.hireDate) : null
    });
    setShowModal(true);
  };

  // Handle image upload
  const handleImageUpload = (file: File) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
      message.error('يمكن رفع ملفات JPG/PNG فقط!');
      return false;
    }
    
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('يجب أن يكون حجم الصورة أقل من 2MB!');
      return false;
    }
    
    setImageFile(file);
    return false; // Prevent automatic upload
  };

  // Check password strength
  const getPasswordStrength = (password: string) => {
    if (!password) return { strength: 0, text: '', color: '' };
    
    let strength = 0;
    let text = '';
    let color = '';
    
    if (password.length >= 6) strength += 1;
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/\d/.test(password)) strength += 1;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength += 1;
    
    if (strength <= 2) {
      text = 'ضعيفة';
      color = 'password-strength-weak';
    } else if (strength <= 4) {
      text = 'متوسطة';
      color = 'password-strength-medium';
    } else {
      text = 'قوية';
      color = 'password-strength-strong';
    }
    
    return { strength, text, color };
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
            {record.uid && (
              <>
                <br />
                <Badge status="success" text="مرتبط بحساب" />
              </>
            )}
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
      title: 'المرتبطين بحساب',
      value: representatives.filter(r => r.uid).length,
      prefix: <UserOutlined style={{ color: '#722ed1' }} />,
    },
    {
      title: 'إجمالي المبيعات',
      value: Object.values(salesData).reduce((sum, data) => sum + data.totalSales, 0),
      prefix: <DollarOutlined style={{ color: '#fa8c16' }} />,
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
                setImageFile(null);
                setPasswordValue('');
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
          setImageFile(null);
          setPasswordValue('');
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
          preserve={false}
          initialValues={{
            status: 'active',
            department: 'المبيعات'
          }}
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

          {/* Password Field - Only show for new representatives */}
          {!editId && (
            <>
              <Divider orientation="right">بيانات تسجيل الدخول</Divider>
              <div className="sales-rep-form-section">
                <Text type="secondary">
                  <LockOutlined className="ml-2" />
                  سيتم إنشاء حساب مستخدم للمندوب باستخدام البريد الإلكتروني وكلمة المرور أدناه
                </Text>
              </div>
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="password"
                    label="كلمة المرور"
                    rules={[
                      { required: true, message: 'يرجى إدخال كلمة المرور' },
                      { min: 6, message: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' }
                    ]}
                  >
                    <Input.Password
                      placeholder="كلمة المرور"
                      value={passwordValue}
                      onChange={(e) => {
                        const newValue = e.target.value;
                        setPasswordValue(newValue);
                        form.setFieldValue('password', newValue);
                      }}
                      iconRender={(visible) => 
                        visible ? <EyeOutlined /> : <EyeInvisibleOutlined />
                      }
                    />
                    {passwordValue && (
                      <div className="mt-1">
                        <Text className={getPasswordStrength(passwordValue).color} style={{ fontSize: '12px' }}>
                          قوة كلمة المرور: {getPasswordStrength(passwordValue).text}
                        </Text>
                      </div>
                    )}
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="confirmPassword"
                    label="تأكيد كلمة المرور"
                    dependencies={['password']}
                    rules={[
                      { required: true, message: 'يرجى تأكيد كلمة المرور' },
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          const password = getFieldValue('password');
                          if (!value) {
                            return Promise.reject(new Error('يرجى تأكيد كلمة المرور'));
                          }
                          if (!password) {
                            return Promise.resolve();
                          }
                          if (password === value) {
                            return Promise.resolve();
                          }
                          return Promise.reject(new Error('كلمتا المرور غير متطابقتان!'));
                        },
                      }),
                    ]}
                  >
                    <Input.Password
                      placeholder="تأكيد كلمة المرور"
                      iconRender={(visible) => 
                        visible ? <EyeOutlined /> : <EyeInvisibleOutlined />
                      }
                    />
                  </Form.Item>
                </Col>
              </Row>
            </>
          )}

          {/* Profile Picture Upload */}
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item 
                name="avatar"
                label="صورة شخصية"
                valuePropName="file"
              >
                <Upload
                  name="avatar"
                  listType="picture-card"
                  className="sales-rep-avatar-uploader"
                  showUploadList={false}
                  beforeUpload={handleImageUpload}
                  accept="image/*"
                >
                  {form.getFieldValue('avatar') || imageFile ? (
                    <img 
                      src={imageFile ? URL.createObjectURL(imageFile) : form.getFieldValue('avatar')} 
                      alt="avatar" 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                  ) : (
                    <div>
                      <UploadOutlined />
                      <div className="ant-upload-text">رفع صورة</div>
                    </div>
                  )}
                </Upload>
                {uploadingImage && (
                  <div className="sales-rep-uploading">
                    جاري رفع الصورة...
                  </div>
                )}
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="phone"
                label="رقم الهاتف"
                rules={[{ required: true, message: 'يرجى إدخال رقم الهاتف' }]}
              >
                <Input placeholder="رقم الهاتف" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
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
