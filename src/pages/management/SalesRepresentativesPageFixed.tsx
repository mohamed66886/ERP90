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
import { createUserWithEmailAndPassword, updateProfile, signOut } from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { auth, storage } from "@/lib/firebase";
import { initializeApp, deleteApp } from "firebase/app";
import { getAuth } from "firebase/auth";

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
      console.log('Loading branches...');
      const branchesSnapshot = await getDocs(collection(db, "branches"));
      console.log('Found', branchesSnapshot.docs.length, 'branches');
      
      const branchesData = branchesSnapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name || doc.data().nameAr || 'فرع غير محدد'
      }));
      
      console.log('Branches loaded:', branchesData);
      setBranches(branchesData);
    } catch (error) {
      console.error('Error loading branches:', error);
      message.error('حدث خطأ في تحميل الفروع: ' + (error as Error).message);
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
      console.log('Loading representatives...');
      const querySnapshot = await getDocs(collection(db, "salesRepresentatives"));
      console.log('Found', querySnapshot.docs.length, 'representatives');
      
      const repsData = querySnapshot.docs.map(doc => {
        const data = doc.data();
        const branch = branches.find(b => b.id === data.branch);
        console.log('Processing representative:', doc.id, data.name);
        
        return {
          id: doc.id,
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          branch: data.branch || '',
          branchName: branch?.name || 'فرع غير محدد',
          department: data.department || '',
          position: data.position || '',
          hireDate: data.hireDate || '',
          status: data.status || 'active',
          avatar: data.avatar || '',
          address: data.address || '',
          notes: data.notes || '',
          commissionRate: data.commissionRate || 0,
          salary: data.salary || 0,
          uid: data.uid || '',
          currentSales: salesData[doc.id]?.totalSales || 0,
          createdAt: data.createdAt || new Date(),
          updatedAt: data.updatedAt || new Date()
        } as SalesRepresentative;
      });
      
      console.log('Processed representatives:', repsData);
      setRepresentatives(repsData);
    } catch (error) {
      console.error('Error loading representatives:', error);
      message.error('حدث خطأ في تحميل بيانات المندوبين: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  }, [branches, salesData]);

  // Convert image to Base64 with compression
  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Set maximum dimensions
        const maxWidth = 300;
        const maxHeight = 300;
        
        let { width, height } = img;
        
        // Calculate new dimensions maintaining aspect ratio
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }
        
        // Set canvas dimensions
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress image
        ctx?.drawImage(img, 0, 0, width, height);
        
        // Convert to base64 with compression
        const base64 = canvas.toDataURL('image/jpeg', 0.7); // 70% quality
        resolve(base64);
      };
      
      img.onerror = () => {
        // Fallback to FileReader if canvas method fails
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  // Upload image to Firebase Storage
  const uploadImage = async (file: File): Promise<string> => {
    try {
      // استخدام Base64 مباشرة لتجنب مشاكل CORS
      console.log('Converting image to Base64...');
      const base64 = await convertToBase64(file);
      console.log('Image converted to Base64 successfully');
      return base64;
    } catch (error) {
      console.error('Error converting image to Base64:', error);
      throw new Error('فشل في معالجة الصورة. يرجى المحاولة مرة أخرى.');
    }
  };

  // Create user account in Firebase Auth using secondary app
  const createUserAccount = async (email: string, password: string, displayName: string, photoURL?: string) => {
    let secondaryApp;
    try {
      // إنشاء تطبيق ثانوي لـ Firebase لتجنب تغيير حالة المصادقة الحالية
      secondaryApp = initializeApp({
        apiKey: "AIzaSyD90dtZlGUTXEyUD_72ZxjXrBX7oJ1oG3g",
        authDomain: "erp90-8a628.firebaseapp.com",
        projectId: "erp90-8a628",
        storageBucket: "erp90-8a628.firebasestorage.app",
        messagingSenderId: "67289042547",
        appId: "1:67289042547:web:55300d06c6dab5429ba406"
      }, 'secondary');
      
      const secondaryAuth = getAuth(secondaryApp);
      
      // إنشاء المستخدم الجديد باستخدام التطبيق الثانوي
      const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, password);
      
      // تحديث ملف المستخدم
      const profileUpdate: { displayName: string; photoURL?: string } = {
        displayName
      };
      
      // Firebase Auth photoURL has a length limit, so we skip it for Base64 images
      if (photoURL && !photoURL.startsWith('data:')) {
        profileUpdate.photoURL = photoURL;
      }
      
      await updateProfile(userCredential.user, profileUpdate);
      
      // تسجيل خروج من التطبيق الثانوي
      await signOut(secondaryAuth);
      
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
          case 'auth/invalid-profile-attribute':
            errorMessage = 'خطأ في بيانات الملف الشخصي';
            break;
        }
      }
      
      throw new Error(errorMessage);
    } finally {
      // تنظيف التطبيق الثانوي
      if (secondaryApp) {
        try {
          await deleteApp(secondaryApp);
        } catch (cleanupError) {
          console.warn('Error cleaning up secondary app:', cleanupError);
        }
      }
    }
  };

  // Test Firebase connection
  const testFirebaseConnection = async () => {
    try {
      console.log('Testing Firebase connection...');
      
      // Test Firestore read
      const testCollection = collection(db, "salesRepresentatives");
      const snapshot = await getDocs(testCollection);
      console.log('Firestore read test:', snapshot.size, 'documents found');
      
      // Test Firestore write (add a test document)
      const testDoc = {
        name: 'Test Representative',
        email: 'test@example.com',
        phone: '123456789',
        branch: 'test-branch',
        department: 'test',
        position: 'test',
        status: 'active',
        hireDate: dayjs().format('YYYY-MM-DD'),
        createdAt: new Date(),
        updatedAt: new Date(),
        isTest: true
      };
      
      const docRef = await addDoc(testCollection, testDoc);
      console.log('Firestore write test: Document added with ID:', docRef.id);
      
      // Delete the test document
      await deleteDoc(doc(db, "salesRepresentatives", docRef.id));
      console.log('Test document deleted');
      
      message.success('Firebase connection test passed!');
      
    } catch (error) {
      console.error('Firebase connection test failed:', error);
      message.error('Firebase connection failed: ' + (error as Error).message);
    }
  };

  useEffect(() => {
    console.log('Component mounted, loading branches...');
    loadBranches();
  }, []);

  useEffect(() => {
    console.log('Branches updated:', branches.length);
    if (branches.length > 0) {
      console.log('Loading sales data...');
      loadSalesData();
    }
  }, [branches]);

  useEffect(() => {
    console.log('Sales data or branches updated');
    if (branches.length > 0) {
      console.log('Loading representatives...');
      loadRepresentatives();
    }
  }, [branches, salesData, loadRepresentatives]);

  // Handle form submission
  const handleSubmit = async (values: Partial<SalesRepresentative>) => {
    try {
      setLoading(true);
      console.log('Form submitted with values:', values);
      
      let avatarURL = values.avatar;
      let userUID = values.uid;
      
      // Use the image that was already processed in handleImageUpload
      if (imageFile) {
        try {
          setUploadingImage(true);
          avatarURL = await uploadImage(imageFile);
          setUploadingImage(false);
          console.log('Image processed:', avatarURL ? 'Success' : 'Failed');
        } catch (error) {
          setUploadingImage(false);
          console.error('Image upload error:', error);
          message.error((error as Error).message);
          return;
        }
      }
      
      // Create user account for new representative
      if (!editId && values.email && values.password) {
        try {
          console.log('Creating user account...');
          // Don't pass Base64 image to Firebase Auth as it's too long
          const photoForAuth = avatarURL && !avatarURL.startsWith('data:') ? avatarURL : undefined;
          userUID = await createUserAccount(
            values.email,
            values.password,
            values.name || '',
            photoForAuth
          );
          console.log('User account created with UID:', userUID);
          message.success('تم إنشاء حساب المستخدم بنجاح');
        } catch (error) {
          console.error('User creation error:', error);
          message.error((error as Error).message);
          return;
        }
      }
      
      // Prepare data for saving
      const repData = {
        name: values.name || '',
        email: values.email || '',
        phone: values.phone || '',
        branch: values.branch || '',
        department: values.department || 'المبيعات',
        position: values.position || '',
        status: values.status || 'active',
        avatar: avatarURL || '',
        address: values.address || '',
        notes: values.notes || '',
        commissionRate: values.commissionRate ? Number(values.commissionRate) : 0,
        salary: values.salary ? Number(values.salary) : 0,
        uid: userUID || '',
        hireDate: values.hireDate ? dayjs(values.hireDate).format('YYYY-MM-DD') : '',
        createdAt: editId ? representatives.find(r => r.id === editId)?.createdAt || new Date() : new Date(),
        updatedAt: new Date(),
      };
      
      console.log('Saving representative data:', repData);

      if (editId) {
        console.log('Updating representative with ID:', editId);
        await updateDoc(doc(db, "salesRepresentatives", editId), repData);
        message.success('تم تحديث بيانات المندوب بنجاح');
        console.log('Representative updated successfully');
      } else {
        console.log('Adding new representative...');
        const docRef = await addDoc(collection(db, "salesRepresentatives"), repData);
        console.log('Representative added with ID:', docRef.id);
        message.success('تم إضافة المندوب بنجاح');
      }

      setShowModal(false);
      setEditId(null);
      setImageFile(null);
      setPasswordValue('');
      form.resetFields();
      
      // Reload data
      console.log('Reloading representatives...');
      await loadRepresentatives();
      
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      message.error('حدث خطأ في حفظ البيانات: ' + (error as Error).message);
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
  const handleImageUpload = async (file: File) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/gif' || file.type === 'image/webp';
    if (!isJpgOrPng) {
      message.error('يمكن رفع ملفات الصور فقط (JPG, PNG, GIF, WebP)!');
      return false;
    }
    
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error('يجب أن يكون حجم الصورة أقل من 5MB!');
      return false;
    }
    
    try {
      setUploadingImage(true);
      // تحويل الصورة إلى Base64 مباشرة
      const base64 = await convertToBase64(file);
      form.setFieldValue('avatar', base64);
      setImageFile(file);
      message.success('تم تحديد الصورة بنجاح');
    } catch (error) {
      console.error('Error processing image:', error);
      message.error('فشل في معالجة الصورة');
    } finally {
      setUploadingImage(false);
    }
    
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
            <Text strong>{sales.toLocaleString()} ريال</Text>
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
            <Text>{commission.toLocaleString()} ريال</Text>
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

  // ...تمت إزالة الإحصائيات...

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
              popupMatchSelectWidth={false}
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
              popupMatchSelectWidth={false}
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
        {representatives.length === 0 && !loading ? (
          <div style={{ textAlign: 'center', padding: '50px 0' }}>
            <Empty 
              description="لا توجد بيانات مندوبين"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            >
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={() => {
                  setEditId(null);
                  setImageFile(null);
                  setPasswordValue('');
                  form.resetFields();
                  setShowModal(true);
                }}
              >
                إضافة أول مندوب
              </Button>
            </Empty>
          </div>
        ) : (
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
        )}
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
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  صورة شخصية
                </label>
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
                      src={
                        imageFile 
                          ? URL.createObjectURL(imageFile) 
                          : form.getFieldValue('avatar')
                      } 
                      alt="avatar" 
                      style={{ 
                        width: '100%', 
                        height: '100%', 
                        objectFit: 'cover',
                        borderRadius: '6px'
                      }} 
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
                    <Spin size="small" /> جاري معالجة الصورة...
                  </div>
                )}
              </div>
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
                <Select placeholder="اختر الفرع" popupMatchSelectWidth={false}>
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
                <Select placeholder="اختر القسم" popupMatchSelectWidth={false}>
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
                <Select placeholder="اختر الحالة" popupMatchSelectWidth={false}>
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
