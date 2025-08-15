import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Modal, 
  Form, 
  Input, 
  Select, 
  Switch, 
  message, 
  Tabs, 
  Checkbox, 
  Space,
  Tag,
  Row,
  Col,
  Divider,
  Typography
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  ShopOutlined,
  UserOutlined,
  BranchesOutlined,
  FileTextOutlined,
  SwapOutlined
} from '@ant-design/icons';
import { FaWarehouse } from 'react-icons/fa';
import { FiBookOpen } from 'react-icons/fi';

import { fetchBranches, Branch } from '../../utils/branches';
import { getMainAccounts, getAccountsByLevel, getAccountLevels, Account } from '../../services/accountsService';
import { 
  addWarehouseWithSubAccount, 
  updateWarehouse, 
  deleteWarehouseWithSubAccount, 
  fetchWarehouses 
} from '../../services/warehouseService';
import Breadcrumb from '@/components/Breadcrumb';
import { 
  collection, 
  getDocs, 
  query,
  orderBy
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

const { Title, Text } = Typography;
const { Option } = Select;

interface Warehouse {
  id?: string;
  nameAr: string;
  nameEn: string;
  branch?: string;
  address?: string;
  status: 'active' | 'inactive' | 'suspended';
  mainAccount?: string;
  subAccountId?: string;
  subAccountCode?: string;
  allowedUsers?: string[];
  allowedBranches?: string[];
  documentType?: 'invoice' | 'warehouse';
  invoiceTypes?: string[];
  warehouseOperations?: string[];
}

interface User {
  id: string;
  name: string;
  email: string;
}

const AdvancedWarehouseManagement: React.FC = () => {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [mainAccounts, setMainAccounts] = useState<Account[]>([]);
  const [accountLevels, setAccountLevels] = useState<number[]>([]);
  const [accountsByLevel, setAccountsByLevel] = useState<Account[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentWarehouse, setCurrentWarehouse] = useState<Warehouse | null>(null);
  const [activeTab, setActiveTab] = useState('1');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [selectedBranches, setSelectedBranches] = useState<string[]>([]);
  const [userSearchText, setUserSearchText] = useState('');
  const [branchSearchText, setBranchSearchText] = useState('');
  const [form] = Form.useForm();

  useEffect(() => {
    fetchBranches().then(setBranches);
    getMainAccounts().then(setMainAccounts);
    getAccountLevels().then(setAccountLevels);
    loadWarehouses();
    loadUsers();
  }, []);

  // إعادة تحميل مستوى الحساب عند تغيير الحسابات الرئيسية
  useEffect(() => {
    if (currentWarehouse && currentWarehouse.mainAccount && mainAccounts.length > 0) {
      const account = mainAccounts.find(acc => acc.id === currentWarehouse.mainAccount);
      if (account && account.level && !selectedLevel) {
        setSelectedLevel(account.level);
        form.setFieldsValue({ accountLevel: account.level });
        
        getAccountsByLevel(account.level).then(accounts => {
          setAccountsByLevel(accounts);
        }).catch(error => {
          console.error('Error loading accounts by level:', error);
        });
      }
    }
  }, [mainAccounts, currentWarehouse, selectedLevel, form]);

  const loadWarehouses = async () => {
    setLoading(true);
    try {
      const data = await fetchWarehouses();
      setWarehouses(data);
    } catch (error) {
      console.error('Error loading warehouses:', error);
      message.error('فشل في تحميل بيانات المخازن');
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const data = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as User[];
      setUsers(data);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const handleAdd = () => {
    form.resetFields();
    setSelectedLevel(null);
    setAccountsByLevel([]);
    setSelectedUsers([]);
    setSelectedBranches([]);
    setUserSearchText('');
    setBranchSearchText('');
    setCurrentWarehouse(null);
    setActiveTab('1');
    setIsModalOpen(true);
  };

  const handleEdit = (warehouse: Warehouse) => {
    setCurrentWarehouse(warehouse);
    
    // تعيين القيم في النموذج
    form.setFieldsValue({
      nameAr: warehouse.nameAr,
      nameEn: warehouse.nameEn,
      branch: warehouse.branch,
      address: warehouse.address,
      status: warehouse.status,
      parentAccount: warehouse.mainAccount,
      documentType: warehouse.documentType,
      invoiceTypes: warehouse.invoiceTypes || [],
      warehouseOperations: warehouse.warehouseOperations || []
    });
    
    // تعيين المستخدمين والفروع المحددين
    setSelectedUsers(warehouse.allowedUsers || []);
    setSelectedBranches(warehouse.allowedBranches || []);
    
    // إذا كان لدينا حساب رئيسي، نحتاج لتحديد مستوى الحساب
    if (warehouse.mainAccount && mainAccounts.length > 0) {
      // البحث عن الحساب في القائمة الرئيسية
      const account = mainAccounts.find(acc => acc.id === warehouse.mainAccount);
      if (account && account.level) {
        // تحديد مستوى الحساب وتحميل الحسابات لهذا المستوى
        setSelectedLevel(account.level);
        form.setFieldsValue({ accountLevel: account.level });
        
        // تحميل الحسابات للمستوى المحدد
        getAccountsByLevel(account.level).then(accounts => {
          setAccountsByLevel(accounts);
        }).catch(error => {
          console.error('Error loading accounts by level:', error);
        });
      }
    }
    
    setIsModalOpen(true);
  };

  const handleLevelChange = async (level: number) => {
    setSelectedLevel(level);
    const accounts = await getAccountsByLevel(level);
    setAccountsByLevel(accounts);
    form.setFieldsValue({ parentAccount: undefined });
  };

  // دالة مساعدة لتنظيف البيانات وإزالة القيم undefined
  const cleanWarehouseData = (values: Record<string, unknown>) => {
    const cleanData: Record<string, unknown> = {
      nameAr: values.nameAr,
      nameEn: values.nameEn,
      branch: values.branch,
      status: values.status,
      mainAccount: values.parentAccount,
      allowedUsers: selectedUsers,
      allowedBranches: selectedBranches,
      invoiceTypes: values.invoiceTypes || [],
      warehouseOperations: values.warehouseOperations || []
    };

    // إضافة الحقول الاختيارية فقط إذا كانت لها قيم
    if (values.address && typeof values.address === 'string' && values.address.trim()) {
      cleanData.address = values.address;
    }

    if (values.documentType) {
      cleanData.documentType = values.documentType;
    }

    return cleanData;
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();

      // التحقق من اختيار مستخدم واحد على الأقل
      if (!selectedUsers || selectedUsers.length === 0) {
        message.error('يرجى اختيار مستخدم واحد على الأقل مسموح له بالوصول لهذا المخزن');
        setActiveTab('2'); // الانتقال إلى تبويب المستخدمين
        return;
      }

      // التحقق من اختيار فرع واحد على الأقل
      if (!selectedBranches || selectedBranches.length === 0) {
        message.error('يرجى اختيار فرع واحد على الأقل مسموح له بالوصول لهذا المخزن');
        setActiveTab('3'); // الانتقال إلى تبويب الفروع
        return;
      }

      // التحقق من اختيار نوع الاستخدام
      if (!values.documentType) {
        message.error('يرجى اختيار نوع الاستخدام أولاً');
        setActiveTab('4'); // الانتقال إلى تبويب الاستخدام
        return;
      }

      const warehouseData = cleanWarehouseData(values);

      if (currentWarehouse) {
        await updateWarehouse(currentWarehouse.id!, warehouseData);
        message.success('تم تحديث المخزن بنجاح');
      } else {
        await addWarehouseWithSubAccount(warehouseData);
        message.success('تم إضافة المخزن والحساب الفرعي بنجاح');
      }

      setIsModalOpen(false);
      form.resetFields();
      setSelectedLevel(null);
      setAccountsByLevel([]);
      setSelectedUsers([]);
      setSelectedBranches([]);
      setUserSearchText('');
      setBranchSearchText('');
      loadWarehouses();
    } catch (err: unknown) {
      console.error('Error saving warehouse:', err);

      // التحقق من نوع الخطأ
      if (typeof err === 'object' && err !== null && 'errorFields' in err) {
        // خطأ في التحقق من صحة النموذج
        const validationError = err as { errorFields: { errors: string[] }[] };
        if (validationError.errorFields && validationError.errorFields.length > 0) {
          const firstError = validationError.errorFields[0];
          message.error(`خطأ في الحقل: ${firstError.errors[0]}`);
        } else {
          message.error('يرجى ملء جميع الحقول المطلوبة');
        }
      } else if (err instanceof Error) {
        // خطأ في قاعدة البيانات أو خطأ آخر
        if (err.message.includes('index') || err.message.includes('Index')) {
          message.error('جاري إعداد قاعدة البيانات. يرجى المحاولة مرة أخرى خلال دقيقة.');
        } else if (err.message.includes('permission') || err.message.includes('Permission')) {
          message.error('ليس لديك صلاحية لتنفيذ هذا الإجراء.');
        } else if (err.message.includes('network') || err.message.includes('Network')) {
          message.error('مشكلة في الاتصال بالإنترنت. يرجى التحقق من اتصالك.');
        } else {
          message.error(`خطأ: ${err.message}`);
        }
      } else {
        // خطأ غير محدد
        message.error('حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.');
      }
    }
  };

  const handleModalCancel = () => {
    setIsModalOpen(false);
    form.resetFields();
    setSelectedUsers([]);
    setSelectedBranches([]);
    setUserSearchText('');
    setBranchSearchText('');
    setCurrentWarehouse(null);
    setSelectedLevel(null);
    setAccountsByLevel([]);
    setActiveTab('1');
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteWarehouseWithSubAccount(id);
      loadWarehouses();
      message.success('تم حذف المخزن بنجاح');
    } catch (error) {
      console.error('Error deleting warehouse:', error);
      message.error('حدث خطأ أثناء حذف المخزن');
    }
  };

  const handleUserSelection = (userId: string, checked: boolean) => {
    if (userId === 'all') {
      if (checked) {
        // تحديد جميع المستخدمين
        setSelectedUsers(users.map(user => user.id));
      } else {
        // إلغاء تحديد الكل
        setSelectedUsers([]);
      }
    } else {
      if (checked) {
        setSelectedUsers([...selectedUsers, userId]);
      } else {
        setSelectedUsers(selectedUsers.filter(id => id !== userId));
      }
    }
  };

  const handleBranchSelection = (branchId: string, checked: boolean) => {
    if (branchId === 'all') {
      if (checked) {
        // تحديد جميع الفروع
        setSelectedBranches(branches.map(branch => branch.id));
      } else {
        // إلغاء تحديد الكل
        setSelectedBranches([]);
      }
    } else {
      if (checked) {
        setSelectedBranches([...selectedBranches, branchId]);
      } else {
        setSelectedBranches(selectedBranches.filter(id => id !== branchId));
      }
    }
  };

  // تصفية البيانات للبحث
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(userSearchText.toLowerCase()) ||
    user.email.toLowerCase().includes(userSearchText.toLowerCase())
  );

  const filteredBranches = branches.filter(branch => 
    branch.name.toLowerCase().includes(branchSearchText.toLowerCase()) ||
    (branch.address && branch.address.toLowerCase().includes(branchSearchText.toLowerCase()))
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'green';
      case 'inactive': return 'red';
      case 'suspended': return 'orange';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'نشط';
      case 'inactive': return 'غير نشط';
      case 'suspended': return 'متوقف';
      default: return status;
    }
  };

  const columns = [
    {
      title: '#',
      dataIndex: 'index',
      key: 'index',
      render: (_: unknown, __: unknown, idx: number) => idx + 1,
      width: 60,
      align: 'center' as const,
    },
    {
      title: 'اسم المخزن (عربي)',
      dataIndex: 'nameAr',
      key: 'nameAr',
    },
    {
      title: 'اسم المخزن (إنجليزي)',
      dataIndex: 'nameEn',
      key: 'nameEn',
    },
    {
      title: 'الفرع',
      dataIndex: 'branch',
      key: 'branch',
      render: (branchId: string) => branches.find(b => b.id === branchId)?.name || '',
    },
    {
      title: 'العنوان',
      dataIndex: 'address',
      key: 'address',
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
      title: 'الحساب الرئيسي',
      dataIndex: 'mainAccount',
      key: 'mainAccount',
      render: (accId: string) => {
        if (!accId) return '';
        const acc = mainAccounts.find(a => a.id === accId);
        if (acc) return acc.nameAr;
        return 'غير متوفر'; // عرض نص بديل إذا لم يوجد الحساب في القائمة
      },
    },
    {
      title: 'الحساب الفرعي',
      dataIndex: 'subAccountCode',
      key: 'subAccountCode',
      render: (code: string) => code || 'لم يتم إنشاء حساب فرعي',
    },
    {
      title: 'الإجراءات',
      key: 'actions',
      align: 'center' as const,
      render: (_: unknown, record: Warehouse) => (
        <Space>
          <Button 
            icon={<EditOutlined style={{ color: '#1677ff' }} />} 
            type="link" 
            onClick={() => handleEdit(record)} 
          />
          <Button 
            icon={<DeleteOutlined style={{ color: '#ff4d4f' }} />} 
            type="link" 
            onClick={() => handleDelete(record.id!)} 
          />
        </Space>
      ),
    },
  ];

  const userColumns = [
    {
      title: 'اسم المستخدم',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'البريد الإلكتروني',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'تحديد',
      key: 'select',
      render: (_: unknown, record: User | { id: string; name: string; email: string }) => (
        <Checkbox
          checked={record.id === 'all' ? selectedUsers.length === users.length : selectedUsers.includes(record.id)}
          onChange={(e) => handleUserSelection(record.id, e.target.checked)}
        />
      ),
    },
  ];

  const branchColumns = [
    {
      title: 'اسم الفرع',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'العنوان',
      dataIndex: 'address',
      key: 'address',
    },
    {
      title: 'تحديد',
      key: 'select',
      render: (_: unknown, record: Branch | { id: string; name: string; address: string }) => (
        <Checkbox
          checked={record.id === 'all' ? selectedBranches.length === branches.length : selectedBranches.includes(record.id)}
          onChange={(e) => handleBranchSelection(record.id, e.target.checked)}
        />
      ),
    },
  ];

  return (
    <div className="w-full p-6 space-y-6 min-h-screen" dir="rtl">
      {/* Header - updated design */}
      <div className="p-4 font-['Tajawal'] bg-white mb-4 rounded-lg shadow-[0_0_10px_rgba(0,0,0,0.1)] relative overflow-hidden">
        <div className="flex items-center">
          <FaWarehouse className="h-8 w-8 text-green-600 ml-3" />
          <h1 className="text-2xl font-bold text-gray-800">دليل المخازن</h1>
        </div>
        <p className="text-gray-600 mt-2">عرض وإدارة دليل المخازن</p>
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-blue-500"></div>
      </div>

      <Breadcrumb
        items={[
          { label: "الرئيسية", to: "/" },
          { label: "المخازن", to: "/stores" },
          { label: "إدارة المخازن المتقدمة" },
        ]}
      />

      {/* Main Content */}
      <Card>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <Title level={3} style={{ margin: 0, color: '#222' }}>
            <ShopOutlined style={{ marginLeft: 8 }} />
            المخازن
          </Title>
          <Space>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              إضافة مخزن
            </Button>
          </Space>
        </div>

        <Table
          dataSource={warehouses}
          columns={columns}
          rowKey={(record: Warehouse) => record.id!}
          loading={loading}
          pagination={{ pageSize: 10 }}
          locale={{ emptyText: 'لا توجد مخازن' }}
        />
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        title={currentWarehouse ? "تعديل المخزن" : "إضافة مخزن جديد"}
        open={isModalOpen}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        okText="حفظ"
        cancelText="إلغاء"
        width={900}
        style={{ top: 20 }}
      >
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
          items={[
            {
              key: '1',
              label: 'البيانات الأساسية',
              children: (
                <Form
                  form={form}
                  layout="vertical"
                  initialValues={{ 
                    nameAr: '', 
                    nameEn: '', 
                    branch: '', 
                    address: '',
                    status: 'active',
                    accountLevel: '', 
                    parentAccount: '' 
                  }}
                >
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        label="اسم المخزن (عربي)"
                        name="nameAr"
                        rules={[{ required: true, message: 'يرجى إدخال اسم المخزن بالعربي' }]}
                      >
                        <Input placeholder="اسم المخزن بالعربي" />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        label="اسم المخزن (إنجليزي)"
                        name="nameEn"
                        rules={[{ required: true, message: 'يرجى إدخال اسم المخزن بالإنجليزي' }]}
                      >
                        <Input placeholder="اسم المخزن بالإنجليزي" />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        label="الفرع"
                        name="branch"
                        rules={[{ required: true, message: 'يرجى اختيار الفرع' }]}
                      >
                        <Select 
                          placeholder="اختر الفرع"
                          showSearch
                          filterOption={(input, option) =>
                            (option?.children?.toString().toLowerCase() ?? '').includes(input.toLowerCase())
                          }
                        >
                          {branches.map(branch => (
                            <Option key={branch.id} value={branch.id}>{branch.name}</Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        label="الحالة"
                        name="status"
                        rules={[{ required: true, message: 'يرجى اختيار الحالة' }]}
                      >
                        <Select 
                          placeholder="اختر الحالة"
                          showSearch
                          filterOption={(input, option) =>
                            (option?.children?.toString().toLowerCase() ?? '').includes(input.toLowerCase())
                          }
                        >
                          <Option value="active">نشط</Option>
                          <Option value="inactive">غير نشط</Option>
                          <Option value="suspended">متوقف</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>

                  <Form.Item
                    label="العنوان"
                    name="address"
                    rules={[{ required: true, message: 'يرجى إدخال عنوان المخزن' }]}
                  >
                    <Input.TextArea placeholder="عنوان المخزن" rows={3} />
                  </Form.Item>

                  <Divider>ربط الحساب المالي</Divider>

                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        label="مستوى الحساب"
                        name="accountLevel"
                        rules={[
                          { 
                            required: !currentWarehouse, 
                            message: 'يرجى اختيار مستوى الحساب' 
                          }
                        ]}
                      >
                        <Select 
                          placeholder="اختر مستوى الحساب" 
                          onChange={handleLevelChange}
                          showSearch
                          filterOption={(input, option) =>
                            (option?.children?.toString().toLowerCase() ?? '').includes(input.toLowerCase())
                          }
                        >
                          {accountLevels.map(level => (
                            <Option key={level} value={level}>المستوى {level}</Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        label="الحساب الأب"
                        name="parentAccount"
                        rules={[
                          { 
                            required: !currentWarehouse, 
                            message: 'يرجى اختيار الحساب الأب' 
                          }
                        ]}
                      >
                        <Select 
                          placeholder="اختر الحساب الأب" 
                          disabled={!selectedLevel}
                          showSearch
                          filterOption={(input, option) =>
                            (option?.children?.toString().toLowerCase() ?? '').includes(input.toLowerCase())
                          }
                        >
                          {accountsByLevel.map(account => (
                            <Option key={account.id} value={account.id}>
                              {account.nameAr} - {account.code}
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>
                </Form>
              )
            },
            {
              key: '2',
              label: (
                <span>
                  <UserOutlined />
                  المستخدمين
                </span>
              ),
              children: (
                <>
                  <div style={{ marginBottom: 16 }}>
                    <Text strong>اختر المستخدمين المسموح لهم بالوصول لهذا المخزن:</Text>
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <Input.Search
                      placeholder="البحث في المستخدمين..."
                      value={userSearchText}
                      onChange={(e) => setUserSearchText(e.target.value)}
                      style={{ width: '100%' }}
                      allowClear
                    />
                  </div>
                  <Table
                    dataSource={[
                      { id: 'all', name: 'تحديد الكل', email: 'جميع المستخدمين' },
                      ...filteredUsers
                    ]}
                    columns={userColumns}
                    rowKey="id"
                    pagination={{ pageSize: 5, showSizeChanger: false }}
                    size="small"
                    locale={{ emptyText: 'لا توجد مستخدمين' }}
                    scroll={{ y: 300 }}
                  />
                </>
              )
            },
            {
              key: '3',
              label: (
                <span>
                  <BranchesOutlined />
                  الفروع
                </span>
              ),
              children: (
                <>
                  <div style={{ marginBottom: 16 }}>
                    <Text strong>اختر الفروع المسموح لها بالوصول لهذا المخزن:</Text>
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <Input.Search
                      placeholder="البحث في الفروع..."
                      value={branchSearchText}
                      onChange={(e) => setBranchSearchText(e.target.value)}
                      style={{ width: '100%' }}
                      allowClear
                    />
                  </div>
                  <Table
                    dataSource={[
                      { id: 'all', name: 'تحديد الكل', address: 'جميع الفروع' },
                      ...filteredBranches
                    ]}
                    columns={branchColumns}
                    rowKey="id"
                    pagination={{ pageSize: 5, showSizeChanger: false }}
                    size="small"
                    locale={{ emptyText: 'لا توجد فروع' }}
                    scroll={{ y: 300 }}
                  />
                </>
              )
            },
            {
              key: '4',
              label: (
                <span>
                  <FileTextOutlined />
                  الاستخدام
                </span>
              ),
              children: (
                <Form form={form} layout="vertical">
                  <Form.Item
                    label="نوع الاستخدام"
                    name="documentType"
                    rules={[{ required: true, message: 'يرجى اختيار نوع الاستخدام' }]}
                  >
                    <Select 
                      placeholder="اختر نوع الاستخدام"
                      showSearch
                      filterOption={(input, option) =>
                        (option?.children?.toString().toLowerCase() ?? '').includes(input.toLowerCase())
                      }
                    >
                      <Option value="invoice">فاتورة</Option>
                      <Option value="warehouse">مخزن</Option>
                    </Select>
                  </Form.Item>

                  <Form.Item
                    noStyle
                    shouldUpdate={(prevValues, currentValues) => 
                      prevValues.documentType !== currentValues.documentType
                    }
                  >
                    {({ getFieldValue }) => {
                      const documentType = getFieldValue('documentType');
                      
                      if (documentType === 'invoice') {
                        return (
                          <Form.Item
                            label="أنواع الفواتير"
                            name="invoiceTypes"
                          >
                            <Select 
                              mode="multiple" 
                              placeholder="اختر أنواع الفواتير"
                              showSearch
                              filterOption={(input, option) =>
                                (option?.children?.toString().toLowerCase() ?? '').includes(input.toLowerCase())
                              }
                            >
                              <Option value="sales">فاتورة مبيعات</Option>
                              <Option value="purchase">فاتورة مشتريات</Option>
                              <Option value="all">الكل</Option>
                            </Select>
                          </Form.Item>
                        );
                      }
                      
                      if (documentType === 'warehouse') {
                        return (
                          <Form.Item
                            label="عمليات المخزن"
                            name="warehouseOperations"
                          >
                            <Select 
                              mode="multiple" 
                              placeholder="اختر عمليات المخزن"
                              showSearch
                              filterOption={(input, option) =>
                                (option?.children?.toString().toLowerCase() ?? '').includes(input.toLowerCase())
                              }
                            >
                              <Option value="add">إذن إضافة مخزن</Option>
                              <Option value="issue">إذن صرف مخزن</Option>
                              <Option value="transfer">تحويلات بين المخازن</Option>
                            </Select>
                          </Form.Item>
                        );
                      }
                      
                      return null;
                    }}
                  </Form.Item>
                </Form>
              )
            }
          ]}
        />
      </Modal>
    </div>
  );
};

export default AdvancedWarehouseManagement;
