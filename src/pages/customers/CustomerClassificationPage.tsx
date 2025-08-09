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
  Pagination
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { 
  StarOutlined, 
  SearchOutlined, 
  EyeOutlined, 
  EditOutlined,
  TrophyOutlined,
  CrownOutlined,
  UserOutlined,
  TeamOutlined,
  BuildOutlined,
  FilterOutlined,
  BarChartOutlined,
  RiseOutlined,
  FallOutlined
} from '@ant-design/icons';
import Breadcrumb from "@/components/Breadcrumb";
import { collection, getDocs, updateDoc, doc, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface Customer {
  id: string;
  nameAr: string;
  nameEn: string;
  branch: string;
  commercialReg: string;
  businessType: string;
  activity: string;
  city: string;
  creditLimit: string;
  mobile: string;
  email: string;
  status: "نشط" | "متوقف";
  category?: "VIP" | "ذهبي" | "فضي" | "عادي";
  priority?: "عالي" | "متوسط" | "منخفض";
  docId?: string;
}

type CustomerCategory = "VIP" | "ذهبي" | "فضي" | "عادي";
type CustomerPriority = "عالي" | "متوسط" | "منخفض";

const CustomerClassificationPage: React.FC = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<"all" | CustomerCategory>("all");
  const [priorityFilter, setPriorityFilter] = useState<"all" | CustomerPriority>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const categories: CustomerCategory[] = ["VIP", "ذهبي", "فضي", "عادي"];
  const priorities: CustomerPriority[] = ["عالي", "متوسط", "منخفض"];

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

  // تحديث تصنيف العميل
  const handleCategoryChange = async (customerId: string, newCategory: CustomerCategory) => {
    try {
      await updateDoc(doc(db, "customers", customerId), { 
        category: newCategory,
        lastCategoryUpdate: new Date().toISOString()
      });
      
      message.success(`تم تغيير تصنيف العميل إلى "${newCategory}" بنجاح`);
      
      // تحديث التصنيف في الـ state
      setCustomers(prevCustomers => 
        prevCustomers.map(customer => 
          customer.docId === customerId 
            ? { ...customer, category: newCategory }
            : customer
        )
      );
    } catch (error) {
      message.error("حدث خطأ أثناء تحديث تصنيف العميل");
    }
  };

  // تحديث أولوية العميل
  const handlePriorityChange = async (customerId: string, newPriority: CustomerPriority) => {
    try {
      await updateDoc(doc(db, "customers", customerId), { 
        priority: newPriority,
        lastPriorityUpdate: new Date().toISOString()
      });
      
      message.success(`تم تغيير أولوية العميل إلى "${newPriority}" بنجاح`);
      
      // تحديث الأولوية في الـ state
      setCustomers(prevCustomers => 
        prevCustomers.map(customer => 
          customer.docId === customerId 
            ? { ...customer, priority: newPriority }
            : customer
        )
      );
    } catch (error) {
      message.error("حدث خطأ أثناء تحديث أولوية العميل");
    }
  };

  // تصنيف تلقائي بناءً على الحد الائتماني
  const handleAutoClassification = async () => {
    Modal.confirm({
      title: 'تأكيد التصنيف التلقائي',
      content: 'هل أنت متأكد من التصنيف التلقائي للعملاء؟',
      okText: 'نعم',
      cancelText: 'إلغاء',
      onOk: async () => {
        setLoading(true);
        try {
          const updates = customers.map(customer => {
            if (!customer.docId) return Promise.resolve();
            
            const creditLimit = parseFloat(customer.creditLimit) || 0;
            let category: CustomerCategory;
            let priority: CustomerPriority;
            
            // تصنيف بناءً على الحد الائتماني
            if (creditLimit >= 1000000) {
              category = "VIP";
              priority = "عالي";
            } else if (creditLimit >= 500000) {
              category = "ذهبي";
              priority = "عالي";
            } else if (creditLimit >= 100000) {
              category = "فضي";
              priority = "متوسط";
            } else {
              category = "عادي";
              priority = "منخفض";
            }
            
            return updateDoc(doc(db, "customers", customer.docId), { 
              category,
              priority,
              lastAutoClassification: new Date().toISOString()
            });
          });
          
          await Promise.all(updates);
          
          message.success("تم تصنيف العملاء تلقائياً بنجاح");
          
          fetchCustomers();
        } catch (error) {
          message.error("حدث خطأ أثناء التصنيف التلقائي");
        } finally {
          setLoading(false);
        }
      }
    });
  };

  // تصفية العملاء
  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = Object.values(customer).some(
      value => value && 
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    const matchesCategory = categoryFilter === "all" || customer.category === categoryFilter;
    const matchesPriority = priorityFilter === "all" || customer.priority === priorityFilter;
    
    return matchesSearch && matchesCategory && matchesPriority;
  });

  // ترقيم الصفحات
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const paginatedCustomers = filteredCustomers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // إحصائيات التصنيف
  const getCategoryCount = (category: CustomerCategory) => {
    return customers.filter(c => c.category === category).length;
  };

  const getPriorityCount = (priority: CustomerPriority) => {
    return customers.filter(c => c.priority === priority).length;
  };

  const getCategoryTagColor = (category?: CustomerCategory) => {
    switch (category) {
      case "VIP": return "purple";
      case "ذهبي": return "gold";
      case "فضي": return "default";
      case "عادي": return "blue";
      default: return "default";
    }
  };

  const getPriorityTagColor = (priority?: CustomerPriority) => {
    switch (priority) {
      case "عالي": return "red";
      case "متوسط": return "orange";
      case "منخفض": return "green";
      default: return "default";
    }
  };

  const getCategoryIcon = (category?: CustomerCategory) => {
    switch (category) {
      case "VIP": return <CrownOutlined />;
      case "ذهبي": return <TrophyOutlined />;
      case "فضي": return <UserOutlined />;
      case "عادي": return <TeamOutlined />;
      default: return <BuildOutlined />;
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
      title: "الحد الائتماني",
      dataIndex: "creditLimit",
      key: "creditLimit",
      width: 150,
      render: (creditLimit: string) => (
        creditLimit ? `${parseFloat(creditLimit).toLocaleString()} ر.س` : "غير محدد"
      )
    },
    {
      title: "التصنيف",
      dataIndex: "category",
      key: "category",
      width: 120,
      render: (category: CustomerCategory) => (
        <Tag color={getCategoryTagColor(category)} icon={getCategoryIcon(category)}>
          {category || "غير محدد"}
        </Tag>
      )
    },
    {
      title: "الأولوية",
      dataIndex: "priority",
      key: "priority",
      width: 120,
      render: (priority: CustomerPriority) => (
        <Tag color={getPriorityTagColor(priority)}>
          {priority || "غير محدد"}
        </Tag>
      )
    },
    {
      title: "تغيير التصنيف",
      key: "categoryChange",
      width: 150,
      render: (_, record) => (
        <Select
          value={record.category || undefined}
          placeholder="اختر التصنيف"
          style={{ width: 120 }}
          onChange={(value) => record.docId && handleCategoryChange(record.docId, value)}
        >
          {categories.map(category => (
            <Select.Option key={category} value={category}>{category}</Select.Option>
          ))}
        </Select>
      )
    },
    {
      title: "تغيير الأولوية",
      key: "priorityChange",
      width: 150,
      render: (_, record) => (
        <Select
          value={record.priority || undefined}
          placeholder="اختر الأولوية"
          style={{ width: 120 }}
          onChange={(value) => record.docId && handlePriorityChange(record.docId, value)}
        >
          {priorities.map(priority => (
            <Select.Option key={priority} value={priority}>{priority}</Select.Option>
          ))}
        </Select>
      )
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
            icon={<EditOutlined />}
            onClick={() => navigate(`/customers/edit/${record.docId}`)}
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
            <StarOutlined className="text-2xl text-yellow-600 ml-3" />
            <h1 className="text-2xl font-bold text-gray-800">تصنيف العملاء</h1>
          </div>
          <p className="text-gray-600 mt-2">تصنيف العملاء حسب النوع والقيمة والأولوية</p>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 to-purple-500"></div>
        </div>

        <Breadcrumb
          items={[
            { label: "الرئيسية", to: "/" },
            { label: "إدارة المبيعات", to: "/management/sales" },
            { label: "تصنيف العملاء" },
          ]}
        />

        {/* Category Statistics Cards */}
        <Row gutter={[16, 16]} className="mt-6 mb-6">
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="عملاء VIP"
                value={getCategoryCount("VIP")}
                prefix={<CrownOutlined style={{ color: '#722ed1' }} />}
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
          
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="عملاء ذهبيون"
                value={getCategoryCount("ذهبي")}
                prefix={<TrophyOutlined style={{ color: '#faad14' }} />}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
          
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="عملاء فضيون"
                value={getCategoryCount("فضي")}
                prefix={<UserOutlined style={{ color: '#8c8c8c' }} />}
                valueStyle={{ color: '#8c8c8c' }}
              />
            </Card>
          </Col>
          
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="عملاء عاديون"
                value={getCategoryCount("عادي")}
                prefix={<TeamOutlined style={{ color: '#1890ff' }} />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Priority Statistics */}
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="أولوية عالية"
                value={getPriorityCount("عالي")}
                prefix={<RiseOutlined style={{ color: '#ff4d4f' }} />}
                valueStyle={{ color: '#ff4d4f' }}
              />
            </Card>
          </Col>
          
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="أولوية متوسطة"
                value={getPriorityCount("متوسط")}
                prefix={<BarChartOutlined style={{ color: '#fa8c16' }} />}
                valueStyle={{ color: '#fa8c16' }}
              />
            </Card>
          </Col>
          
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="أولوية منخفضة"
                value={getPriorityCount("منخفض")}
                prefix={<FallOutlined style={{ color: '#52c41a' }} />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Controls */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <Space>
            <Button 
              type="primary"
              icon={<StarOutlined />}
              onClick={handleAutoClassification} 
              disabled={loading}
              style={{ backgroundColor: '#722ed1', borderColor: '#722ed1' }}
            >
              تصنيف تلقائي
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
              value={categoryFilter}
              onChange={(value) => setCategoryFilter(value)}
              style={{ width: 150 }}
              placeholder="التصنيف"
            >
              <Select.Option value="all">جميع التصنيفات</Select.Option>
              {categories.map(category => (
                <Select.Option key={category} value={category}>{category}</Select.Option>
              ))}
            </Select>
            <Select
              value={priorityFilter}
              onChange={(value) => setPriorityFilter(value)}
              style={{ width: 150 }}
              placeholder="الأولوية"
            >
              <Select.Option value="all">جميع الأولويات</Select.Option>
              {priorities.map(priority => (
                <Select.Option key={priority} value={priority}>{priority}</Select.Option>
              ))}
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
              emptyText: searchTerm || categoryFilter !== "all" || priorityFilter !== "all" ? "لا توجد نتائج للبحث" : "لا يوجد عملاء"
            }}
            scroll={{ x: 1400 }}
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

export default CustomerClassificationPage;
