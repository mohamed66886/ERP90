import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Card, 
  Button, 
  Input, 
  Table, 
  Tag, 
  Switch, 
  message, 
  Space,
  Statistic,
  Row,
  Col,
  Select,
  Modal,
  Pagination
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { 
  CheckCircleOutlined, 
  SearchOutlined, 
  EyeOutlined, 
  UserAddOutlined,
  UserDeleteOutlined,
  FilterOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import Breadcrumb from "@/components/Breadcrumb";
import { collection, getDocs, updateDoc, doc, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { format } from 'date-fns';
import { arSA } from 'date-fns/locale';

interface Customer {
  id: string;
  nameAr: string;
  nameEn: string;
  branch: string;
  commercialReg: string;
  regDate: string;
  businessType: string;
  activity: string;
  city: string;
  mobile: string;
  email: string;
  status: "نشط" | "متوقف";
  docId?: string;
  createdAt?: string;
}

const CustomerStatusPage: React.FC = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "نشط" | "متوقف">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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

  // تغيير حالة العميل
  const handleStatusChange = async (customerId: string, newStatus: "نشط" | "متوقف") => {
    try {
      await updateDoc(doc(db, "customers", customerId), { 
        status: newStatus,
        lastStatusUpdate: new Date().toISOString()
      });
      
      message.success(`تم تغيير حالة العميل إلى "${newStatus}" بنجاح`);
      
      // تحديث الحالة في الـ state
      setCustomers(prevCustomers => 
        prevCustomers.map(customer => 
          customer.docId === customerId 
            ? { ...customer, status: newStatus }
            : customer
        )
      );
    } catch (error) {
      message.error("حدث خطأ أثناء تحديث حالة العميل");
    }
  };

  // تفعيل جميع العملاء
  const handleActivateAll = async () => {
    Modal.confirm({
      title: 'تأكيد التفعيل',
      content: 'هل أنت متأكد من تفعيل جميع العملاء؟',
      okText: 'نعم',
      cancelText: 'إلغاء',
      onOk: async () => {
        setLoading(true);
        try {
          const inactiveCustomers = customers.filter(c => c.status === "متوقف");
          const updates = inactiveCustomers.map(customer => 
            customer.docId ? updateDoc(doc(db, "customers", customer.docId), { 
              status: "نشط",
              lastStatusUpdate: new Date().toISOString()
            }) : Promise.resolve()
          );
          
          await Promise.all(updates);
          
          message.success(`تم تفعيل ${inactiveCustomers.length} عميل بنجاح`);
          
          fetchCustomers();
        } catch (error) {
          message.error("حدث خطأ أثناء تفعيل العملاء");
        } finally {
          setLoading(false);
        }
      }
    });
  };

  // إلغاء تفعيل جميع العملاء
  const handleDeactivateAll = async () => {
    Modal.confirm({
      title: 'تأكيد الإلغاء',
      content: 'هل أنت متأكد من إلغاء تفعيل جميع العملاء؟',
      okText: 'نعم',
      cancelText: 'إلغاء',
      onOk: async () => {
        setLoading(true);
        try {
          const activeCustomers = customers.filter(c => c.status === "نشط");
          const updates = activeCustomers.map(customer => 
            customer.docId ? updateDoc(doc(db, "customers", customer.docId), { 
              status: "متوقف",
              lastStatusUpdate: new Date().toISOString()
            }) : Promise.resolve()
          );
          
          await Promise.all(updates);
          
          message.success(`تم إلغاء تفعيل ${activeCustomers.length} عميل بنجاح`);
          
          fetchCustomers();
        } catch (error) {
          message.error("حدث خطأ أثناء إلغاء تفعيل العملاء");
        } finally {
          setLoading(false);
        }
      }
    });
  };

  // تصفية العملاء حسب البحث والحالة
  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = Object.values(customer).some(
      value => value && 
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    const matchesStatus = statusFilter === "all" || customer.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // ترقيم الصفحات
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const paginatedCustomers = filteredCustomers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "غير محدد";
    try {
      return format(new Date(dateStr), "dd/MM/yyyy", { locale: arSA });
    } catch {
      return dateStr;
    }
  };

  const getStatusCount = (status: "نشط" | "متوقف") => {
    return customers.filter(c => c.status === status).length;
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
      title: "الاسم بالعربي",
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
      title: "المدينة",
      dataIndex: "city",
      key: "city",
      width: 130
    },
    {
      title: "الجوال",
      dataIndex: "mobile",
      key: "mobile",
      width: 130
    },
    {
      title: "الحالة الحالية",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status: string) => (
        <Tag color={status === "نشط" ? "green" : "red"}>
          {status}
        </Tag>
      )
    },
    {
      title: "آخر تحديث",
      dataIndex: "createdAt",
      key: "lastUpdate",
      width: 130,
      render: (date: string) => formatDate(date)
    },
    {
      title: "تغيير الحالة",
      key: "statusChange",
      width: 150,
      render: (_, record) => (
        <Space>
          <Switch
            checked={record.status === "نشط"}
            onChange={(checked) => 
              record.docId && handleStatusChange(record.docId, checked ? "نشط" : "متوقف")
            }
          />
          <span className="text-xs text-gray-500">
            {record.status === "نشط" ? "مفعل" : "متوقف"}
          </span>
        </Space>
      )
    },
    {
      title: "الإجراءات",
      key: "actions",
      width: 100,
      render: (_, record) => (
        <Button
          type="text"
          icon={<EyeOutlined />}
          onClick={() => navigate(`/customers/view/${record.docId}`)}
        />
      )
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 rtl" dir="rtl">
      <div className="p-6 lg:p-8">
        {/* Header */}
        <div className="p-4 font-['Tajawal'] bg-white mb-4 rounded-lg shadow-sm relative overflow-hidden">
          <div className="flex items-center">
            <CheckCircleOutlined className="text-2xl text-emerald-600 ml-3" />
            <h1 className="text-2xl font-bold text-gray-800">تفعيل/إلغاء العملاء</h1>
          </div>
          <p className="text-gray-600 mt-2">إدارة حالة العملاء النشطة والمتوقفة</p>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-blue-500"></div>
        </div>

        <Breadcrumb
          items={[
            { label: "الرئيسية", to: "/" },
            { label: "إدارة المبيعات", to: "/management/sales" },
            { label: "تفعيل/إلغاء العملاء" },
          ]}
        />

        {/* Statistics Cards */}
        <Row gutter={[16, 16]} className="mt-6 mb-6">
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="إجمالي العملاء"
                value={customers.length}
                prefix={<UserAddOutlined style={{ color: '#1890ff' }} />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="العملاء النشطون"
                value={getStatusCount("نشط")}
                prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="العملاء المتوقفون"
                value={getStatusCount("متوقف")}
                prefix={<UserDeleteOutlined style={{ color: '#ff4d4f' }} />}
                valueStyle={{ color: '#ff4d4f' }}
              />
            </Card>
          </Col>
          
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="نسبة التفعيل"
                value={customers.length > 0 ? Math.round((getStatusCount("نشط") / customers.length) * 100) : 0}
                suffix="%"
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Controls */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <Space wrap>
            <Button 
              type="primary"
              icon={<UserAddOutlined />}
              onClick={handleActivateAll} 
              disabled={loading || getStatusCount("متوقف") === 0}
              style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
            >
              تفعيل الكل
            </Button>
            <Button 
              danger
              icon={<UserDeleteOutlined />}
              onClick={handleDeactivateAll} 
              disabled={loading || getStatusCount("نشط") === 0}
            >
              إلغاء تفعيل الكل
            </Button>
            <Button 
              icon={<ReloadOutlined />}
              onClick={fetchCustomers} 
              disabled={loading}
            >
              تحديث
            </Button>
          </Space>
          
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
              <Select.Option value="نشط">نشط فقط</Select.Option>
              <Select.Option value="متوقف">متوقف فقط</Select.Option>
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
      </div>
    </div>
  );
};

export default CustomerStatusPage;
