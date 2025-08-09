import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Button,
  Input,
  Form,
  Select,
  message,
  Row,
  Col,
  Divider,
  Typography,
  Space,
  DatePicker,
  InputNumber,
  Spin
} from 'antd';
import {
  UserAddOutlined,
  SaveOutlined,
  ArrowRightOutlined,
  ArrowLeftOutlined
} from '@ant-design/icons';
import Breadcrumb from "@/components/Breadcrumb";
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { format } from 'date-fns';
import dayjs from 'dayjs';

const { Title } = Typography;
const { Option } = Select;

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
}

interface FormValues {
  nameAr: string;
  nameEn: string;
  branch: string;
  commercialReg?: string;
  regDate?: dayjs.Dayjs;
  regAuthority?: string;
  businessType: string;
  activity: string;
  startDate?: dayjs.Dayjs;
  city: string;
  creditLimit?: number;
  region?: string;
  district?: string;
  street?: string;
  buildingNo?: string;
  postalCode?: string;
  phone?: string;
  mobile: string;
  email?: string;
  status: "نشط" | "متوقف";
  taxFileNumber?: string;
  taxFileExpiry?: dayjs.Dayjs;
}

const AddCustomerPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [branches, setBranches] = useState<string[]>([]);
  const [form] = Form.useForm();

  const businessTypes = ["شركة", "مؤسسة", "فرد"];
  const activities = ["مقاولات", "تجارة تجزئة", "صناعة", "خدمات"];
  const cities = ["الرياض", "جدة", "الدمام", "مكة", "الخبر", "الطائف"];
  const statusOptions = ["نشط", "متوقف"] as const;

  // جلب الفروع من Firestore
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const snapshot = await getDocs(collection(db, "branches"));
        setBranches(snapshot.docs.map(doc => (doc.data().name as string)));
      } catch (err) {
        setBranches([]);
      }
    };
    fetchBranches();
  }, []);

  // تحويل الاسم العربي إلى إنجليزي
  const arabicToEnglish = useCallback((text: string) => {
    const namesMap: Record<string, string> = {
      'محمد': 'mohammed', 'محمود': 'mahmoud', 'أحمد': 'ahmed', 'مصطفى': 'mostafa',
      'علي': 'ali', 'حسن': 'hassan', 'حسين': 'hussein', 'ابراهيم': 'ibrahim',
      'يوسف': 'youssef', 'سعيد': 'saeed', 'عبدالله': 'abdullah', 'عبد الله': 'abdullah',
      'خالد': 'khaled', 'سارة': 'sarah', 'فاطمة': 'fatima', 'ياسين': 'yassin',
      'ياسر': 'yasser', 'رشاد': 'rashad', 'سامي': 'sami', 'سلمى': 'salma',
      'نور': 'noor', 'منى': 'mona', 'مريم': 'maryam', 'عمر': 'omar',
      'طارق': 'tarek', 'شريف': 'sherif', 'شيماء': 'shaimaa', 'جميلة': 'jamila',
      'سعد': 'saad', 'عبده': 'abdou',
    };

    let result = text.replace(/[\u064B-\u0652]/g, '');
    
    Object.keys(namesMap).forEach(arabicName => {
      const regex = new RegExp(arabicName, 'g');
      result = result.replace(regex, namesMap[arabicName]);
    });

    result = result
      .replace(/تش/g, 'ch').replace(/ث/g, 'th').replace(/خ/g, 'kh')
      .replace(/ذ/g, 'dh').replace(/ش/g, 'sh').replace(/غ/g, 'gh')
      .replace(/ظ/g, 'z').replace(/ق/g, 'q').replace(/ص/g, 's')
      .replace(/ض/g, 'd').replace(/ط/g, 't').replace(/ع/g, 'a')
      .replace(/ء/g, '').replace(/ؤ/g, 'w').replace(/ئ/g, 'y')
      .replace(/ى/g, 'a').replace(/ة/g, 'a').replace(/ﻻ/g, 'la');

    const map: Record<string, string> = {
      'ا': 'a', 'أ': 'a', 'إ': 'i', 'آ': 'a', 'ب': 'b', 'ت': 't',
      'ج': 'j', 'ح': 'h', 'د': 'd', 'ر': 'r', 'ز': 'z',
      'س': 's', 'ف': 'f', 'ك': 'k', 'ل': 'l', 'م': 'm', 'ن': 'n',
      'ه': 'h', 'و': 'w', 'ي': 'y', ' ': ' '
    };

    result = result.split('').map(c => map[c] || c).join('');
    return result.replace(/\s+/g, ' ').trim();
  }, []);

  // تحديث الاسم الإنجليزي عند تغيير الاسم العربي
  const handleNameArChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const arabicName = e.target.value;
    const englishName = arabicToEnglish(arabicName);
    
    form.setFieldsValue({
      nameAr: arabicName,
      nameEn: englishName
    });
  };

  const handleSubmit = async (values: FormValues) => {
    setLoading(true);
    
    try {
      // جلب العملاء الحاليين لحساب رقم العميل الجديد
      const customersSnapshot = await getDocs(collection(db, "customers"));
      const customers = customersSnapshot.docs.map(doc => doc.data() as Customer);
      
      // حساب رقم العميل الجديد
      const maxNum = customers
        .map(c => {
          const match = /^c-(\d{4})$/.exec(c.id);
          return match ? parseInt(match[1], 10) : 0;
        })
        .reduce((a, b) => Math.max(a, b), 0);
      const nextNum = maxNum + 1;
      const newId = `c-${nextNum.toString().padStart(4, '0')}`;

      // تحويل التواريخ إلى strings
      const customerData: Customer = {
        id: newId,
        nameAr: values.nameAr,
        nameEn: values.nameEn || arabicToEnglish(values.nameAr),
        branch: values.branch,
        commercialReg: values.commercialReg || '',
        regDate: values.regDate ? values.regDate.format('YYYY-MM-DD') : '',
        regAuthority: values.regAuthority || '',
        businessType: values.businessType,
        activity: values.activity,
        startDate: values.startDate ? values.startDate.format('YYYY-MM-DD') : '',
        city: values.city,
        creditLimit: values.creditLimit?.toString() || '',
        region: values.region || '',
        district: values.district || '',
        street: values.street || '',
        buildingNo: values.buildingNo || '',
        postalCode: values.postalCode || '',
        countryCode: 'SA',
        phone: values.phone || '',
        mobile: values.mobile,
        email: values.email || '',
        status: values.status,
        taxFileNumber: values.taxFileNumber || '',
        taxFileExpiry: values.taxFileExpiry ? values.taxFileExpiry.format('YYYY-MM-DD') : ''
      };

      await addDoc(collection(db, "customers"), { 
        ...customerData,
        createdAt: new Date().toISOString()
      });
      
      message.success("تم إضافة العميل بنجاح");
      
      // إعادة تعيين النموذج
      form.resetFields();
      
      // توجيه المستخدم إلى صفحة دليل العملاء
      setTimeout(() => {
        navigate('/customers/directory');
      }, 1500);
      
    } catch (err) {
      console.error('Error adding customer:', err);
      message.error("حدث خطأ أثناء إضافة العميل");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 24, minHeight: '100vh', direction: 'rtl' }}>
      {/* Header */}
      <Card style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <UserAddOutlined style={{ fontSize: 32, color: '#1890ff', marginLeft: 16 }} />
          <div>
            <Title level={2} style={{ margin: 0, color: '#1f2937' }}>إضافة عميل جديد</Title>
            <p style={{ margin: '8px 0 0 0', color: '#6b7280' }}>تسجيل عميل جديد في النظام</p>
          </div>
        </div>
      </Card>

      <Breadcrumb
        items={[
          { label: "الرئيسية", to: "/" },
          { label: "إدارة المبيعات", to: "/management/sales" },
          { label: "إضافة عميل جديد" },
        ]}
      />

      {/* Form Card */}
      <Card style={{ marginTop: 24 }}>
        <Title level={4}>بيانات العميل الأساسية</Title>
        <Divider />
        
        <Spin spinning={loading}>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{
              status: 'نشط',
              regDate: dayjs(),
              countryCode: 'SA'
            }}
          >
            <Row gutter={16}>
              {/* العمود الأول */}
              <Col xs={24} sm={12} md={6}>
                <Form.Item
                  label="رقم العميل"
                  name="id"
                >
                  <Input placeholder="تلقائي" disabled />
                </Form.Item>

                <Form.Item
                  label="الاسم بالعربي"
                  name="nameAr"
                  rules={[{ required: true, message: 'الاسم بالعربي مطلوب' }]}
                >
                  <Input onChange={handleNameArChange} placeholder="أدخل الاسم بالعربي" />
                </Form.Item>

                <Form.Item
                  label="الاسم بالإنجليزي"
                  name="nameEn"
                >
                  <Input placeholder="تلقائي" disabled />
                </Form.Item>

                <Form.Item
                  label="الفرع"
                  name="branch"
                  rules={[{ required: true, message: 'الفرع مطلوب' }]}
                >
                  <Select placeholder="اختر الفرع">
                    {branches.map(branch => (
                      <Option key={branch} value={branch}>{branch}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>

              {/* العمود الثاني */}
              <Col xs={24} sm={12} md={6}>
                <Form.Item
                  label="السجل التجاري"
                  name="commercialReg"
                >
                  <Input placeholder="رقم السجل التجاري" />
                </Form.Item>

                <Form.Item
                  label="تاريخ السجل"
                  name="regDate"
                >
                  <DatePicker style={{ width: '100%' }} placeholder="اختر التاريخ" />
                </Form.Item>

                <Form.Item
                  label="جهة الإصدار"
                  name="regAuthority"
                >
                  <Input placeholder="جهة إصدار السجل" />
                </Form.Item>

                <Form.Item
                  label="نوع العمل"
                  name="businessType"
                  rules={[{ required: true, message: 'نوع العمل مطلوب' }]}
                >
                  <Select placeholder="اختر نوع العمل">
                    {businessTypes.map(type => (
                      <Option key={type} value={type}>{type}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>

              {/* العمود الثالث */}
              <Col xs={24} sm={12} md={6}>
                <Form.Item
                  label="النشاط"
                  name="activity"
                  rules={[{ required: true, message: 'النشاط مطلوب' }]}
                >
                  <Select placeholder="اختر النشاط">
                    {activities.map(activity => (
                      <Option key={activity} value={activity}>{activity}</Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item
                  label="تاريخ بداية التعامل"
                  name="startDate"
                >
                  <DatePicker style={{ width: '100%' }} placeholder="اختر التاريخ" />
                </Form.Item>

                <Form.Item
                  label="المدينة"
                  name="city"
                  rules={[{ required: true, message: 'المدينة مطلوبة' }]}
                >
                  <Select placeholder="اختر المدينة">
                    {cities.map(city => (
                      <Option key={city} value={city}>{city}</Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item
                  label="الحد الائتماني (ر.س)"
                  name="creditLimit"
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    placeholder="0"
                    min={0}
                  />
                </Form.Item>
              </Col>

              {/* العمود الرابع */}
              <Col xs={24} sm={12} md={6}>
                <Form.Item
                  label="الحالة"
                  name="status"
                  rules={[{ required: true, message: 'الحالة مطلوبة' }]}
                >
                  <Select placeholder="اختر الحالة">
                    {statusOptions.map(status => (
                      <Option key={status} value={status}>{status}</Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item
                  label="رقم الجوال"
                  name="mobile"
                  rules={[
                    { required: true, message: 'رقم الجوال مطلوب' },
                    { pattern: /^05\d{8}$/, message: 'رقم الجوال يجب أن يبدأ بـ 05 ويتكون من 10 أرقام' }
                  ]}
                >
                  <Input placeholder="05xxxxxxxx" />
                </Form.Item>

                <Form.Item
                  label="البريد الإلكتروني"
                  name="email"
                  rules={[{ type: 'email', message: 'البريد الإلكتروني غير صالح' }]}
                >
                  <Input placeholder="example@company.com" />
                </Form.Item>
              </Col>
            </Row>

            {/* تفاصيل الملف الضريبي والعنوان */}
            <Card style={{ margin: '24px 0', backgroundColor: '#f8f9fa' }}>
              <Title level={5}>تفاصيل الملف الضريبي والعنوان</Title>
              <Row gutter={16}>
                <Col xs={24} sm={12} md={6}>
                  <Form.Item
                    label="رقم الملف الضريبي"
                    name="taxFileNumber"
                  >
                    <Input placeholder="أدخل رقم الملف الضريبي" />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12} md={6}>
                  <Form.Item
                    label="تاريخ انتهاء الملف الضريبي"
                    name="taxFileExpiry"
                  >
                    <DatePicker style={{ width: '100%' }} placeholder="اختر التاريخ" />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12} md={6}>
                  <Form.Item
                    label="المنطقة"
                    name="region"
                  >
                    <Input placeholder="المنطقة" />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12} md={6}>
                  <Form.Item
                    label="الحي"
                    name="district"
                  >
                    <Input placeholder="الحي" />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12} md={6}>
                  <Form.Item
                    label="الشارع"
                    name="street"
                  >
                    <Input placeholder="الشارع" />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12} md={6}>
                  <Form.Item
                    label="رقم المبنى"
                    name="buildingNo"
                  >
                    <Input placeholder="رقم المبنى" />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12} md={6}>
                  <Form.Item
                    label="الرمز البريدي"
                    name="postalCode"
                  >
                    <Input placeholder="الرمز البريدي" />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12} md={6}>
                  <Form.Item
                    label="الهاتف"
                    name="phone"
                  >
                    <Input placeholder="رقم الهاتف" />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            {/* Action Buttons */}
            <Divider />
            <div style={{ textAlign: 'left' }}>
              <Space>
                <Button
                  onClick={() => navigate('/management/sales')}
                  icon={<ArrowRightOutlined />}
                >
                  إلغاء
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  icon={<SaveOutlined />}
                  style={{ backgroundColor: '#1890ff', borderColor: '#1890ff' }}
                >
                  حفظ العميل
                </Button>
              </Space>
            </div>
          </Form>
        </Spin>
      </Card>
    </div>
  );
};

export default AddCustomerPage;
