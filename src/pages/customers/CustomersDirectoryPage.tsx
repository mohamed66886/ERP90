import React, { useState, useEffect, useCallback } from 'react';import { useNavigate } from 'react-router-dom';import {  Card,  Button,  Input,  Table,  Badge,  message,  Row,  Col,  Typography,  Space,  Tooltip,  Modal,  Statistic,  Empty} from 'antd';import {  BookOutlined,  SearchOutlined,  EditOutlined,  DeleteOutlined,  EyeOutlined,  UserAddOutlined,  DownloadOutlined,  FilterOutlined,  ExclamationCircleOutlined} from '@ant-design/icons';import Breadcrumb from "@/components/Breadcrumb";import { collection, getDocs, deleteDoc, doc, query, orderBy } from 'firebase/firestore';import { db } from '@/lib/firebase';import { format } from 'date-fns';import { arSA } from 'date-fns/locale';import type { ColumnsType } from 'antd/es/table';const { Title } = Typography;const { confirm } = Modal;
interface Customer {
  id: string;
  nameAr: string;
  nameEn: string;
  branch: string;
  commercialReg: string;
  regDate: string;
  regAuthority: string;
  businessType: string;
  activity: string;
  startDate: string;
  city: string;
  creditLimit: string;
  region: string;
  district: string;
  street: string;
  buildingNo: string;
  postalCode: string;
  countryCode: string;
  phone: string;
  mobile: string;
  email: string;
  status: "نشط" | "متوقف";
  taxFileNumber?: string;
  taxFileExpiry?: string;
  docId?: string;
}

const CustomersDirectoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

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

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  // حذف العميل
  const handleDelete = async (docId: string) => {
    confirm({
      title: 'هل أنت متأكد من حذف هذا العميل؟',
      icon: <ExclamationCircleOutlined />,
      content: 'لا يمكن التراجع عن هذا الإجراء',
      okText: 'نعم، احذف',
      cancelText: 'إلغاء',
      okType: 'danger',
      onOk: async () => {
        try {
          await deleteDoc(doc(db, "customers", docId));
          message.success("تم حذف العميل بنجاح");
          fetchCustomers();
        } catch (error) {
          message.error("حدث خطأ أثناء حذف العميل");
        }
      }
    });
  };

  // تصفية العملاء حسب البحث
  const filteredCustomers = customers.filter(customer =>
    Object.values(customer).some(
      value => value && 
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    try {
      return format(new Date(dateStr), "dd/MM/yyyy", { locale: arSA });
    } catch {
      return dateStr;
    }
  };

  const columns: ColumnsType<Customer> = [
    {
      title: 'رقم العميل',
      dataIndex: 'id',
      key: 'id',
      width: 120,
      fixed: 'left',
      render: (text: string) => <span style={{ fontWeight: 500 }}>{text}</span>
    },
    {
      title: 'الاسم بالعربي',
      dataIndex: 'nameAr',
      key: 'nameAr',
      width: 200,
      render: (text: string) => <span style={{ fontWeight: 500 }}>{text}</span>
    },
    {
      title: 'الاسم بالإنجليزي',
      dataIndex: 'nameEn',
      key: 'nameEn',
      width: 200,
    },
    {
      title: 'الفرع',
      dataIndex: 'branch',
      key: 'branch',
      width: 120,
    },
    {
      title: 'السجل التجاري',
      dataIndex: 'commercialReg',
      key: 'commercialReg',
      width: 150,
    },
    {
      title: 'تاريخ السجل',
      dataIndex: 'regDate',
      key: 'regDate',
      width: 120,
      render: (text: string) => formatDate(text)
    },
    {
      title: 'نوع العمل',
      dataIndex: 'businessType',
      key: 'businessType',
      width: 120,
    },
    {
      title: 'المدينة',
      dataIndex: 'city',
      key: 'city',
      width: 100,
    },
    {
      title: 'الجوال',
      dataIndex: 'mobile',
      key: 'mobile',
      width: 120,
    },
    {
      title: 'الحالة',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => (
        <Badge 
          color={status === "نشط" ? "green" : "red"}
          text={status}
        />
      )
    },
    {
      title: 'الإجراءات',
      key: 'actions',
      width: 150,
      fixed: 'right',
      render: (_: unknown, record: Customer) => (
        <Space>
          <Tooltip title="عرض">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => navigate(`/customers/view/${record.docId}`)}
              style={{ color: '#1890ff' }}
            />
          </Tooltip>
          <Tooltip title="تعديل">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => navigate(`/customers/edit/${record.docId}`)}
              style={{ color: '#52c41a' }}
            />
          </Tooltip>
          <Tooltip title="حذف">
            <Button
              type="text"
              icon={<DeleteOutlined />}
              onClick={() => record.docId && handleDelete(record.docId)}
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
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <BookOutlined style={{ fontSize: 32, color: '#9333ea', marginLeft: 16 }} />
          <div>
            <Title level={2} style={{ margin: 0, color: '#1f2937' }}>دليل العملاء</Title>
            <p style={{ margin: '8px 0 0 0', color: '#6b7280' }}>قائمة شاملة بجميع العملاء المسجلين في النظام</p>
          </div>
        </div>
      </Card>

      <Breadcrumb
        items={[
          { label: "الرئيسية", to: "/" },
          { label: "إدارة المبيعات", to: "/management/sales" },
          { label: "دليل العملاء" },
        ]}
      />

      {/* Statistics Cards */}
      <Row gutter={16} style={{ margin: '24px 0' }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="إجمالي العملاء"
              value={customers.length}
              prefix={<BookOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="العملاء النشطون"
              value={customers.filter(c => c.status === "نشط").length}
              prefix={<span style={{ color: '#52c41a', fontSize: 16 }}>●</span>}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="العملاء المتوقفون"
              value={customers.filter(c => c.status === "متوقف").length}
              prefix={<span style={{ color: '#ff4d4f', fontSize: 16 }}>●</span>}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="المدينة الأكثر"
              value={customers.length > 0 ? 
                Object.entries(
                  customers.reduce((acc, c) => {
                    acc[c.city] = (acc[c.city] || 0) + 1;
                    return acc;
                  }, {} as Record<string, number>)
                ).sort(([,a], [,b]) => b - a)[0]?.[0] || "غير محدد"
                : "غير محدد"
              }
              prefix={<span style={{ color: '#9333ea', fontSize: 16 }}>●</span>}
              valueStyle={{ color: '#9333ea', fontSize: 18 }}
            />
          </Card>
        </Col>
      </Row>

      {/* Controls */}
      <Card style={{ marginBottom: 24 }}>
        <Row justify="space-between" align="middle" gutter={16}>
          <Col xs={24} md={8}>
            <Space>
              <span style={{ color: '#666' }}>
                إجمالي العملاء: {filteredCustomers.length}
              </span>
            </Space>
          </Col>
          <Col xs={24} md={16}>
            <Row gutter={8} justify="end">
              <Col xs={24} sm={12} md={8}>
                <Input
                  placeholder="ابحث عن عميل..."
                  prefix={<SearchOutlined />}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  allowClear
                />
              </Col>
              <Col>
                <Button 
                  type="primary"
                  icon={<UserAddOutlined />}
                  onClick={() => navigate('/customers/add')}
                  style={{ backgroundColor: '#1890ff', borderColor: '#1890ff' }}
                >
                  عميل جديد
                </Button>
              </Col>
              <Col>
                <Button 
                  icon={<DownloadOutlined />}
                  onClick={() => message.info('سيتم تطوير ميزة التصدير قريباً')}
                >
                  تصدير
                </Button>
              </Col>
              <Col>
                <Button 
                  icon={<FilterOutlined />}
                  onClick={() => message.info('سيتم تطوير ميزة التصفية قريباً')}
                >
                  تصفية
                </Button>
              </Col>
            </Row>
          </Col>
        </Row>
      </Card>

      {/* Customers Table */}
      <Card>
        <Title level={4}>
          <BookOutlined style={{ marginLeft: 8 }} />
          قائمة العملاء ({filteredCustomers.length})
        </Title>
        
        <Table
          columns={columns}
          dataSource={filteredCustomers}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `عرض ${range[0]}-${range[1]} من ${total} عميل`,
            pageSizeOptions: ['10', '20', '50', '100'],
          }}
          scroll={{ x: 1500, y: 600 }}
          locale={{
            emptyText: searchTerm ? (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="لا توجد نتائج للبحث"
              />
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="لا يوجد عملاء"
              >
                <Button 
                  type="primary"
                  icon={<UserAddOutlined />}
                  onClick={() => navigate('/customers/add')}
                  style={{ backgroundColor: '#1890ff', borderColor: '#1890ff' }}
                >
                  إضافة أول عميل
                </Button>
              </Empty>
            )
          }}
          size="middle"
          bordered
        />
      </Card>
    </div>
  );
};

export default CustomersDirectoryPage;
