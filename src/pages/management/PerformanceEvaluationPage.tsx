import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Button, 
  Select, 
  Table, 
  Space, 
  Row, 
  Col, 
  Statistic, 
  Typography,
  DatePicker,
  Progress,
  Rate,
  Tag,
  Avatar,
  Divider,
  Tooltip,
  message
} from 'antd';
import { 
  BarChartOutlined,
  TrophyOutlined,
  StarOutlined,
  UserOutlined,
  DollarOutlined,
  AimOutlined,
  CalendarOutlined,
  RiseOutlined,
  FallOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  ArrowLeftOutlined,
  EyeOutlined,
  CrownOutlined
} from '@ant-design/icons';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Breadcrumb from "@/components/Breadcrumb";
import { db } from "@/lib/firebase";
import { 
  collection, 
  getDocs,
  query,
  where
} from "firebase/firestore";
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

interface PerformanceData {
  representativeId: string;
  representativeName: string;
  avatar?: string;
  totalSales: number;
  targetsAchieved: number;
  totalTargets: number;
  commissionEarned: number;
  customersSigned: number;
  averageOrderValue: number;
  performanceScore: number;
  rating: number;
  status: 'excellent' | 'good' | 'average' | 'poor';
  period: string;
}

interface Representative {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
}

const PerformanceEvaluationPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const selectedRepFromURL = searchParams.get('rep');
  
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
  const [representatives, setRepresentatives] = useState<Representative[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState('current_month');
  const [selectedRep, setSelectedRep] = useState<string>(selectedRepFromURL || 'all');
  const [loading, setLoading] = useState(false);

  // Load data
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

      // Load real performance data
      const salesSnapshot = await getDocs(collection(db, "sales_invoices"));
      const commissionsSnapshot = await getDocs(collection(db, "salesCommissions"));
      const targetsSnapshot = await getDocs(collection(db, "salesTargets"));

      const performanceByRep: {[key: string]: PerformanceData} = {};

      // Initialize performance data for each representative
      repsData.forEach(rep => {
        performanceByRep[rep.id] = {
          representativeId: rep.id,
          representativeName: rep.name || `مندوب`,
          avatar: rep.avatar,
          totalSales: 0,
          targetsAchieved: 0,
          totalTargets: 0,
          commissionEarned: 0,
          customersSigned: 0,
          averageOrderValue: 0,
          performanceScore: 0,
          rating: 3,
          status: 'average' as 'excellent' | 'good' | 'average' | 'poor',
          period: 'ديسمبر 2024'
        };
      });

      // Calculate sales data
      const salesByRep: {[key: string]: {total: number, orders: number, customers: Set<string>}} = {};
      salesSnapshot.docs.forEach(doc => {
        const data = doc.data();
        const repId = data.delegate || data.representativeId;
        const customerName = data.customerName;
        
        if (repId && performanceByRep[repId]) {
          if (!salesByRep[repId]) {
            salesByRep[repId] = { total: 0, orders: 0, customers: new Set() };
          }
          
          salesByRep[repId].total += data.totals?.total || 0;
          salesByRep[repId].orders += 1;
          
          if (customerName) {
            salesByRep[repId].customers.add(customerName);
          }
        }
      });

      // Update performance data with sales information
      Object.keys(salesByRep).forEach(repId => {
        const salesData = salesByRep[repId];
        performanceByRep[repId].totalSales = salesData.total;
        performanceByRep[repId].customersSigned = salesData.customers.size;
        performanceByRep[repId].averageOrderValue = salesData.orders > 0 ? salesData.total / salesData.orders : 0;
      });

      // Calculate commissions
      commissionsSnapshot.docs.forEach(doc => {
        const data = doc.data();
        const repId = data.representativeId;
        
        if (repId && performanceByRep[repId]) {
          performanceByRep[repId].commissionEarned += data.finalAmount || 0;
        }
      });

      // Calculate targets
      targetsSnapshot.docs.forEach(doc => {
        const data = doc.data();
        const repId = data.representativeId;
        
        if (repId && performanceByRep[repId]) {
          performanceByRep[repId].totalTargets += 1;
          if (data.status === 'achieved') {
            performanceByRep[repId].targetsAchieved += 1;
          }
        }
      });

      // Calculate performance scores and ratings
      Object.keys(performanceByRep).forEach(repId => {
        const data = performanceByRep[repId];
        
        // Performance score based on target achievement and sales
        const targetScore = data.totalTargets > 0 ? (data.targetsAchieved / data.totalTargets) * 50 : 0;
        const salesScore = Math.min((data.totalSales / 100000) * 30, 30); // Scale based on 100k target
        const customerScore = Math.min(data.customersSigned * 2, 20); // 2 points per customer, max 20
        
        data.performanceScore = Math.round(targetScore + salesScore + customerScore);
        
        // Rating based on performance score
        if (data.performanceScore >= 80) {
          data.rating = 5;
          data.status = 'excellent';
        } else if (data.performanceScore >= 65) {
          data.rating = 4;
          data.status = 'good';
        } else if (data.performanceScore >= 50) {
          data.rating = 3;
          data.status = 'average';
        } else {
          data.rating = 2;
          data.status = 'poor';
        }
      });

      setPerformanceData(Object.values(performanceByRep));
    } catch (error) {
      console.error('Error loading data:', error);
      message.error('حدث خطأ في تحميل بيانات الأداء');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter data based on selected representative
  const filteredData = selectedRep === 'all' 
    ? performanceData 
    : performanceData.filter(data => data.representativeId === selectedRep);

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'green';
      case 'good': return 'blue';
      case 'average': return 'orange';
      case 'poor': return 'red';
      default: return 'default';
    }
  };

  // Get status text
  const getStatusText = (status: string) => {
    switch (status) {
      case 'excellent': return 'ممتاز';
      case 'good': return 'جيد';
      case 'average': return 'متوسط';
      case 'poor': return 'ضعيف';
      default: return status;
    }
  };

  // Get performance trend icon
  const getPerformanceTrendIcon = (score: number) => {
    if (score >= 80) return <RiseOutlined style={{ color: '#52c41a' }} />;
    if (score >= 60) return <CheckCircleOutlined style={{ color: '#1890ff' }} />;
    return <FallOutlined style={{ color: '#ff4d4f' }} />;
  };

  // Table columns
  const columns = [
    {
      title: 'المندوب',
      key: 'representative',
      render: (_, record: PerformanceData) => (
        <Space>
          <Avatar 
            size={40} 
            src={record.avatar} 
            icon={<UserOutlined />}
          >
            {!record.avatar && record.representativeName.charAt(0)}
          </Avatar>
          <div>
            <Text strong>{record.representativeName}</Text>
            <br />
            <Text type="secondary">{record.period}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'إجمالي المبيعات',
      dataIndex: 'totalSales',
      key: 'totalSales',
      render: (amount: number) => `${amount.toLocaleString()} ج.م`,
      sorter: (a: PerformanceData, b: PerformanceData) => a.totalSales - b.totalSales,
    },
    {
      title: 'تحقيق الأهداف',
      key: 'targetsProgress',
      render: (_, record: PerformanceData) => {
        const percentage = (record.targetsAchieved / record.totalTargets) * 100;
        return (
          <div>
            <Progress 
              percent={percentage} 
              size="small"
              status={percentage >= 80 ? 'success' : percentage >= 60 ? 'normal' : 'exception'}
            />
            <Text type="secondary">
              {record.targetsAchieved}/{record.totalTargets} أهداف
            </Text>
          </div>
        );
      },
      sorter: (a: PerformanceData, b: PerformanceData) => 
        (a.targetsAchieved / a.totalTargets) - (b.targetsAchieved / b.totalTargets),
    },
    {
      title: 'العمولة المكتسبة',
      dataIndex: 'commissionEarned',
      key: 'commissionEarned',
      render: (amount: number) => `${amount.toLocaleString()} ج.م`,
      sorter: (a: PerformanceData, b: PerformanceData) => a.commissionEarned - b.commissionEarned,
    },
    {
      title: 'العملاء الجدد',
      dataIndex: 'customersSigned',
      key: 'customersSigned',
      sorter: (a: PerformanceData, b: PerformanceData) => a.customersSigned - b.customersSigned,
    },
    {
      title: 'متوسط قيمة الطلب',
      dataIndex: 'averageOrderValue',
      key: 'averageOrderValue',
      render: (amount: number) => `${amount.toLocaleString()} ج.م`,
      sorter: (a: PerformanceData, b: PerformanceData) => a.averageOrderValue - b.averageOrderValue,
    },
    {
      title: 'نقاط الأداء',
      key: 'performanceScore',
      render: (_, record: PerformanceData) => (
        <Space>
          {getPerformanceTrendIcon(record.performanceScore)}
          <Text strong style={{ 
            color: record.performanceScore >= 80 ? '#52c41a' : 
                   record.performanceScore >= 60 ? '#1890ff' : '#ff4d4f' 
          }}>
            {record.performanceScore}/100
          </Text>
        </Space>
      ),
      sorter: (a: PerformanceData, b: PerformanceData) => a.performanceScore - b.performanceScore,
    },
    {
      title: 'التقييم',
      key: 'rating',
      render: (_, record: PerformanceData) => (
        <div>
          <Rate disabled defaultValue={record.rating} allowHalf />
          <br />
          <Tag color={getStatusColor(record.status)}>
            {getStatusText(record.status)}
          </Tag>
        </div>
      ),
    },
  ];

  // Calculate overall statistics
  const totalSales = filteredData.reduce((sum, data) => sum + data.totalSales, 0);
  const averagePerformanceScore = filteredData.length > 0 
    ? filteredData.reduce((sum, data) => sum + data.performanceScore, 0) / filteredData.length 
    : 0;
  const topPerformers = filteredData.filter(data => data.status === 'excellent').length;
  const totalCommissions = filteredData.reduce((sum, data) => sum + data.commissionEarned, 0);

  const statistics = [
    {
      title: 'إجمالي المبيعات',
      value: totalSales,
      prefix: <DollarOutlined style={{ color: '#1890ff' }} />,
      formatter: (value: number) => `${value.toLocaleString()} ج.م`,
    },
    {
      title: 'متوسط نقاط الأداء',
      value: Math.round(averagePerformanceScore),
      prefix: <BarChartOutlined style={{ color: '#52c41a' }} />,
      suffix: '/100',
    },
    {
      title: 'المتميزون',
      value: topPerformers,
      prefix: <TrophyOutlined style={{ color: '#faad14' }} />,
    },
    {
      title: 'إجمالي العمولات',
      value: totalCommissions,
      prefix: <StarOutlined style={{ color: '#722ed1' }} />,
      formatter: (value: number) => `${value.toLocaleString()} ج.م`,
    },
  ];

  return (
    <div className="p-6" dir="rtl">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
        <div className="flex items-center justify-between">
          <div>
            <Title level={2} className="mb-0">تقييم الأداء</Title>
            <Text type="secondary">تقييم أداء فريق المبيعات والمندوبين</Text>
          </div>
          <Space>
            <Button 
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate('/management/sales-representatives')}
            >
              العودة للمندوبين
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
          </Space>
        </div>
      </div>

      <Breadcrumb
        items={[
          { label: "الرئيسية", to: "/" },
          { label: "إدارة المبيعات", to: "/management/sales" },
          { label: "تقييم الأداء" }
        ]}
      />

      {/* Filters */}
      <Card className="mb-6">
        <Row gutter={16} align="middle">
          <Col xs={24} sm={8}>
            <Select
              style={{ width: '100%' }}
              placeholder="اختر الفترة"
              value={selectedPeriod}
              onChange={setSelectedPeriod}
            >
              <Option value="current_month">الشهر الحالي</Option>
              <Option value="last_month">الشهر الماضي</Option>
              <Option value="current_quarter">الربع الحالي</Option>
              <Option value="last_quarter">الربع الماضي</Option>
              <Option value="current_year">السنة الحالية</Option>
            </Select>
          </Col>
          <Col xs={24} sm={8}>
            <Select
              style={{ width: '100%' }}
              placeholder="اختر المندوب"
              value={selectedRep}
              onChange={setSelectedRep}
            >
              <Option value="all">جميع المندوبين</Option>
              {representatives.map(rep => (
                <Option key={rep.id} value={rep.id}>{rep.name}</Option>
              ))}
            </Select>
          </Col>
        </Row>
      </Card>

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
                formatter={stat.formatter}
              />
            </Card>
          </Col>
        ))}
      </Row>

      {/* Performance Rankings */}
      <Row gutter={16} className="mb-6">
        <Col xs={24} md={12}>
          <Card title="أفضل المبيعات">
            <div className="space-y-4">
              {filteredData
                .sort((a, b) => b.totalSales - a.totalSales)
                .slice(0, 5)
                .map((data, index) => (
                  <div key={data.representativeId} className="flex items-center justify-between">
                    <Space>
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold">
                        {index + 1}
                      </div>
                      <Avatar size="small" src={data.avatar} icon={<UserOutlined />} />
                      <Text>{data.representativeName}</Text>
                    </Space>
                    <Text strong>{data.totalSales.toLocaleString()} ج.م</Text>
                  </div>
                ))}
            </div>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title="أعلى نقاط أداء">
            <div className="space-y-4">
              {filteredData
                .sort((a, b) => b.performanceScore - a.performanceScore)
                .slice(0, 5)
                .map((data, index) => (
                  <div key={data.representativeId} className="flex items-center justify-between">
                    <Space>
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center text-xs font-bold">
                        {index + 1}
                      </div>
                      <Avatar size="small" src={data.avatar} icon={<UserOutlined />} />
                      <Text>{data.representativeName}</Text>
                    </Space>
                    <Space>
                      <Progress 
                        type="circle" 
                        size={30} 
                        percent={data.performanceScore} 
                        format={() => data.performanceScore}
                      />
                    </Space>
                  </div>
                ))}
            </div>
          </Card>
        </Col>
      </Row>

      {/* Performance Table */}
      <Card title="تفاصيل الأداء">
        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="representativeId"
          loading={loading}
          scroll={{ x: 1200 }}
          pagination={{
            total: filteredData.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} من ${total} مندوب`,
          }}
        />
      </Card>
    </div>
  );
};

export default PerformanceEvaluationPage;
