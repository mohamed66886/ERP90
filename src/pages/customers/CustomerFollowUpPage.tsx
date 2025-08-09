import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Card, 
  Button, 
  Input, 
  Table, 
  Tag, 
  Select, 
  message, 
  Space,
  Statistic,
  Row,
  Col,
  Modal,
  Pagination,
  DatePicker,
  Form,
  Divider,
  List,
  Avatar
} from 'antd';
import { Input as AntdTextArea } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { 
  EyeOutlined, 
  SearchOutlined, 
  EditOutlined,
  PhoneOutlined,
  MailOutlined,
  UserOutlined,
  MessageOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  PlusOutlined,
  AlertOutlined
} from '@ant-design/icons';
import Breadcrumb from "@/components/Breadcrumb";
import { collection, getDocs, addDoc, updateDoc, doc, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { format } from 'date-fns';
import { arSA } from 'date-fns/locale';
import dayjs from 'dayjs';

const { TextArea } = AntdTextArea;

interface Customer {
  id: string;
  nameAr: string;
  nameEn: string;
  branch: string;
  businessType: string;
  city: string;
  mobile: string;
  email: string;
  status: "نشط" | "متوقف";
  category?: "VIP" | "ذهبي" | "فضي" | "عادي";
  lastContactDate?: string;
  nextFollowUpDate?: string;
  customerNotes?: string;
  docId?: string;
}

interface FollowUpRecord {
  id?: string;
  customerId: string;
  customerName: string;
  contactType: "مكالمة" | "بريد إلكتروني" | "زيارة" | "رسالة";
  contactDate: string;
  nextFollowUpDate?: string;
  notes: string;
  status: "مكتمل" | "مجدول" | "متأخر";
  createdBy: string;
  createdAt: string;
}

const CustomerFollowUpPage: React.FC = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [followUpRecords, setFollowUpRecords] = useState<FollowUpRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "due" | "overdue" | "completed">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [form] = Form.useForm();
  const itemsPerPage = 10;

  const contactTypes = ["مكالمة", "بريد إلكتروني", "زيارة", "رسالة"];
  const followUpStatuses = ["مكتمل", "مجدول", "متأخر"];

  // جلب العملاء من Firestore
  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "customers"), orderBy("id", "asc"));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(docSnap => ({ 
        ...docSnap.data() as Customer, 
        docId: docSnap.id 
      }));
      setCustomers(data);
    } catch (err) {
      message.error("حدث خطأ أثناء جلب بيانات العملاء");
    } finally {
      setLoading(false);
    }
  }, []);

  // جلب سجلات المتابعة
  const fetchFollowUpRecords = useCallback(async () => {
    try {
      const q = query(collection(db, "customerFollowUps"), orderBy("contactDate", "desc"));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(docSnap => ({ 
        ...docSnap.data() as FollowUpRecord, 
        id: docSnap.id 
      }));
      setFollowUpRecords(data);
    } catch (err) {
      console.error("Error fetching follow-up records:", err);
    }
  }, []);

  useEffect(() => {
    fetchCustomers();
    fetchFollowUpRecords();
  }, [fetchCustomers, fetchFollowUpRecords]);

  // إضافة متابعة جديدة
  const handleAddFollowUp = async (values: {
    contactType: "مكالمة" | "بريد إلكتروني" | "زيارة" | "رسالة";
    contactDate: dayjs.Dayjs;
    nextFollowUpDate?: dayjs.Dayjs;
    status: "مكتمل" | "مجدول" | "متأخر";
    notes: string;
  }) => {
    if (!selectedCustomer) {
      message.error("يرجى اختيار العميل");
      return;
    }

    try {
      const followUpData: FollowUpRecord = {
        customerId: selectedCustomer.docId!,
        customerName: selectedCustomer.nameAr,
        contactType: values.contactType,
        contactDate: values.contactDate.format('YYYY-MM-DD'),
        nextFollowUpDate: values.nextFollowUpDate?.format('YYYY-MM-DD'),
        notes: values.notes,
        status: values.status,
        createdBy: "المستخدم الحالي", // TODO: replace with actual user
        createdAt: new Date().toISOString()
      };

      await addDoc(collection(db, "customerFollowUps"), followUpData);

      // تحديث تاريخ آخر اتصال للعميل
      if (selectedCustomer.docId) {
        await updateDoc(doc(db, "customers", selectedCustomer.docId), {
          lastContactDate: followUpData.contactDate,
          nextFollowUpDate: followUpData.nextFollowUpDate,
          lastFollowUpUpdate: new Date().toISOString()
        });
      }

      message.success("تم إضافة متابعة العميل بنجاح");

      setShowAddModal(false);
      setSelectedCustomer(null);
      form.resetFields();

      fetchCustomers();
      fetchFollowUpRecords();
    } catch (error) {
      message.error("حدث خطأ أثناء حفظ المتابعة");
    }
  };

  // حساب حالة المتابعة
  const getFollowUpStatus = (customer: Customer) => {
    const today = new Date();
    const nextFollowUp = customer.nextFollowUpDate ? new Date(customer.nextFollowUpDate) : null;
    
    if (!nextFollowUp) return "no-date";
    if (nextFollowUp < today) return "overdue";
    if (nextFollowUp.toDateString() === today.toDateString()) return "due";
    return "scheduled";
  };

  // تصفية العملاء
  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = Object.values(customer).some(
      value => value && 
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    let matchesStatus = true;
    if (statusFilter !== "all") {
      const followUpStatus = getFollowUpStatus(customer);
      switch (statusFilter) {
        case "due":
          matchesStatus = followUpStatus === "due";
          break;
        case "overdue":
          matchesStatus = followUpStatus === "overdue";
          break;
        case "completed":
          matchesStatus = followUpStatus === "scheduled";
          break;
      }
    }
    
    return matchesSearch && matchesStatus;
  });

  // ترقيم الصفحات
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const paginatedCustomers = filteredCustomers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "غير محدد";
    try {
      return format(new Date(dateStr), "dd/MM/yyyy", { locale: arSA });
    } catch {
      return dateStr;
    }
  };

  const getStatusTag = (customer: Customer) => {
    const status = getFollowUpStatus(customer);
    switch (status) {
      case "overdue":
        return <Tag color="red" icon={<ExclamationCircleOutlined />}>متأخر</Tag>;
      case "due":
        return <Tag color="orange" icon={<ClockCircleOutlined />}>مستحق اليوم</Tag>;
      case "scheduled":
        return <Tag color="green" icon={<CheckCircleOutlined />}>مجدول</Tag>;
      default:
        return <Tag color="default">غير محدد</Tag>;
    }
  };

  const getFollowUpStats = () => {
    let due = 0, overdue = 0, scheduled = 0;
    
    customers.forEach(customer => {
      const status = getFollowUpStatus(customer);
      switch (status) {
        case "due": due++; break;
        case "overdue": overdue++; break;
        case "scheduled": scheduled++; break;
      }
    });
    
    return { due, overdue, scheduled, total: customers.length };
  };

  const stats = getFollowUpStats();

  const openAddFollowUpModal = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowAddModal(true);
    form.setFieldsValue({
      contactType: "مكالمة",
      contactDate: dayjs(),
      status: "مكتمل"
    });
  };

  const getContactIcon = (type: string) => {
    switch (type) {
      case "مكالمة": return <PhoneOutlined />;
      case "بريد إلكتروني": return <MailOutlined />;
      case "زيارة": return <UserOutlined />;
      case "رسالة": return <MessageOutlined />;
      default: return <MessageOutlined />;
    }
  };

  const columns: ColumnsType<Customer> = [
    {
      title: "رقم العميل",
      dataIndex: "id",
      key: "id",
      width: 120,
      render: (text: string) => <span className="font-medium">{text}</span>
    },
    {
      title: "اسم العميل",
      dataIndex: "nameAr",
      key: "nameAr",
      width: 200,
      render: (text: string) => <span className="font-medium">{text}</span>
    },
    {
      title: "الفرع",
      dataIndex: "branch",
      key: "branch",
      width: 130
    },
    {
      title: "نوع العمل",
      dataIndex: "businessType",
      key: "businessType",
      width: 130
    },
    {
      title: "الجوال",
      dataIndex: "mobile",
      key: "mobile",
      width: 130
    },
    {
      title: "آخر اتصال",
      dataIndex: "lastContactDate",
      key: "lastContactDate",
      width: 130,
      render: (date: string) => formatDate(date)
    },
    {
      title: "المتابعة القادمة",
      dataIndex: "nextFollowUpDate",
      key: "nextFollowUpDate",
      width: 130,
      render: (date: string) => formatDate(date)
    },
    {
      title: "الحالة",
      key: "status",
      width: 120,
      render: (_, record) => getStatusTag(record)
    },
    {
      title: "الإجراءات",
      key: "actions",
      width: 120,
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/customers/view/${record.docId}`)}
          />
          <Button
            type="text"
            icon={<PlusOutlined />}
            onClick={() => openAddFollowUpModal(record)}
          />
        </Space>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 rtl" dir="rtl">
      <div className="p-6 lg:p-8">
        {/* Header */}
        <div className="p-4 font-['Tajawal'] bg-white mb-4 rounded-lg shadow-sm relative overflow-hidden">
          <div className="flex items-center">
            <EyeOutlined className="text-2xl text-indigo-600 ml-3" />
            <h1 className="text-2xl font-bold text-gray-800">متابعة العملاء</h1>
          </div>
          <p className="text-gray-600 mt-2">متابعة وتقييم العملاء وجدولة الاتصالات</p>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-400 to-purple-500"></div>
        </div>

        <Breadcrumb
          items={[
            { label: "الرئيسية", to: "/" },
            { label: "إدارة المبيعات", to: "/management/sales" },
            { label: "متابعة العملاء" },
          ]}
        />

        {/* Statistics Cards */}
        <Row gutter={[16, 16]} className="mt-6 mb-6">
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="إجمالي العملاء"
                value={stats.total}
                prefix={<UserOutlined style={{ color: '#1890ff' }} />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="متابعة اليوم"
                value={stats.due}
                prefix={<ClockCircleOutlined style={{ color: '#fa8c16' }} />}
                valueStyle={{ color: '#fa8c16' }}
              />
            </Card>
          </Col>
          
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="متابعة متأخرة"
                value={stats.overdue}
                prefix={<ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />}
                valueStyle={{ color: '#ff4d4f' }}
              />
            </Card>
          </Col>
          
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="متابعة مجدولة"
                value={stats.scheduled}
                prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Controls */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">
              عرض {filteredCustomers.length} من {customers.length} عميل
            </span>
          </div>
          
          <Space className="w-full md:w-auto">
            <Input
              placeholder="ابحث عن عميل..."
              prefix={<SearchOutlined />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: 250 }}
            />
            <Select
              value={statusFilter}
              onChange={(value) => setStatusFilter(value)}
              style={{ width: 150 }}
            >
              <Select.Option value="all">جميع الحالات</Select.Option>
              <Select.Option value="due">مستحق اليوم</Select.Option>
              <Select.Option value="overdue">متأخر</Select.Option>
              <Select.Option value="completed">مجدول</Select.Option>
            </Select>
          </Space>
        </div>

        {/* Customers Table */}
        <Card className="overflow-hidden">
          <Table
            columns={columns}
            dataSource={paginatedCustomers}
            loading={loading}
            pagination={false}
            rowKey="id"
            locale={{
              emptyText: searchTerm || statusFilter !== "all" ? "لا توجد نتائج للبحث" : "لا يوجد عملاء"
            }}
            scroll={{ x: 1200 }}
          />

          {/* Pagination */}
          {filteredCustomers.length > itemsPerPage && (
            <div className="flex items-center justify-between p-4 border-t">
              <div className="text-sm text-gray-500">
                عرض {Math.min((currentPage - 1) * itemsPerPage + 1, filteredCustomers.length)}-
                {Math.min(currentPage * itemsPerPage, filteredCustomers.length)} من {filteredCustomers.length} عميل
              </div>
              <Pagination
                current={currentPage}
                total={filteredCustomers.length}
                pageSize={itemsPerPage}
                onChange={setCurrentPage}
                showSizeChanger={false}
                showQuickJumper
              />
            </div>
          )}
        </Card>

        {/* Recent Follow-ups */}
        <Card className="mt-6" title="آخر المتابعات">
          <List
            dataSource={followUpRecords.slice(0, 5)}
            locale={{ emptyText: "لا توجد متابعات مسجلة" }}
            renderItem={(record) => (
              <List.Item>
                <List.Item.Meta
                  avatar={
                    <Avatar icon={getContactIcon(record.contactType)} style={{ backgroundColor: '#1890ff' }} />
                  }
                  title={
                    <div className="flex items-center justify-between">
                      <span>{record.customerName}</span>
                      <Tag color={record.status === "مكتمل" ? "green" : "orange"}>
                        {record.status}
                      </Tag>
                    </div>
                  }
                  description={
                    <div>
                      <p className="text-sm text-gray-500 mb-1">
                        {record.contactType} - {formatDate(record.contactDate)}
                      </p>
                      <p className="text-sm">{record.notes}</p>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        </Card>

        {/* Add Follow-up Modal */}
        <Modal
          title="إضافة متابعة للعميل"
          open={showAddModal}
          onCancel={() => {
            setShowAddModal(false);
            setSelectedCustomer(null);
            form.resetFields();
          }}
          footer={null}
          width={600}
        >
          {selectedCustomer && (
            <>
              <p className="mb-4 text-gray-600">
                إضافة سجل متابعة جديد للعميل: <strong>{selectedCustomer.nameAr}</strong>
              </p>
              <Form
                form={form}
                layout="vertical"
                onFinish={handleAddFollowUp}
              >
                <Form.Item
                  name="contactType"
                  label="نوع الاتصال"
                  rules={[{ required: true, message: 'يرجى اختيار نوع الاتصال' }]}
                >
                  <Select placeholder="اختر نوع الاتصال">
                    {contactTypes.map(type => (
                      <Select.Option key={type} value={type}>{type}</Select.Option>
                    ))}
                  </Select>
                </Form.Item>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="contactDate"
                      label="تاريخ الاتصال"
                      rules={[{ required: true, message: 'يرجى اختيار تاريخ الاتصال' }]}
                    >
                      <DatePicker style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="nextFollowUpDate"
                      label="تاريخ المتابعة القادمة"
                    >
                      <DatePicker style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item
                  name="status"
                  label="حالة المتابعة"
                  rules={[{ required: true, message: 'يرجى اختيار حالة المتابعة' }]}
                >
                  <Select placeholder="اختر الحالة">
                    {followUpStatuses.map(status => (
                      <Select.Option key={status} value={status}>{status}</Select.Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item
                  name="notes"
                  label="ملاحظات المتابعة"
                  rules={[{ required: true, message: 'يرجى إدخال ملاحظات المتابعة' }]}
                >
                  <TextArea
                    rows={3}
                    placeholder="أدخل ملاحظات المتابعة..."
                  />
                </Form.Item>

                <Form.Item className="mb-0">
                  <Space className="w-full justify-end">
                    <Button onClick={() => {
                      setShowAddModal(false);
                      setSelectedCustomer(null);
                      form.resetFields();
                    }}>
                      إلغاء
                    </Button>
                    <Button type="primary" htmlType="submit">
                      حفظ المتابعة
                    </Button>
                  </Space>
                </Form.Item>
              </Form>
            </>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default CustomerFollowUpPage;
