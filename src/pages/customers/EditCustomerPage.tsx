import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Card, 
  Button, 
  Input, 
  Select, 
  message, 
  Form,
  Row,
  Col,
  Spin,
  DatePicker
} from 'antd';
import { 
  EditOutlined, 
  SaveOutlined, 
  ArrowRightOutlined, 
  LoadingOutlined 
} from '@ant-design/icons';
import Breadcrumb from "@/components/Breadcrumb";
import { collection, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import dayjs from 'dayjs';

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

const EditCustomerPage: React.FC = () => {
  const navigate = useNavigate();
  const { customerId } = useParams<{ customerId: string }>();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [branches, setBranches] = useState<string[]>([]);
  const [customerData, setCustomerData] = useState<Customer | null>(null);

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

  // جلب بيانات العميل
  useEffect(() => {
    const fetchCustomer = async () => {
      if (!customerId) {
        message.error("معرف العميل غير صحيح");
        navigate('/customers/directory');
        return;
      }

      setInitialLoading(true);
      try {
        const customerDoc = await getDoc(doc(db, "customers", customerId));
        if (customerDoc.exists()) {
          const data = { ...customerDoc.data(), docId: customerDoc.id } as Customer;
          setCustomerData(data);
          
          // تعبئة النموذج بالبيانات
          form.setFieldsValue({
            ...data,
            regDate: data.regDate ? dayjs(data.regDate) : null,
            startDate: data.startDate ? dayjs(data.startDate) : null,
            taxFileExpiry: data.taxFileExpiry ? dayjs(data.taxFileExpiry) : null,
          });
        } else {
          message.error("العميل غير موجود");
          navigate('/customers/directory');
        }
      } catch (err) {
        message.error("حدث خطأ أثناء جلب بيانات العميل");
        navigate('/customers/directory');
      } finally {
        setInitialLoading(false);
      }
    };

    fetchCustomer();
  }, [customerId, navigate, form]);

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

  // التعامل مع تغيير الاسم العربي
  const handleNameArChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const arabicName = e.target.value;
    const englishName = arabicToEnglish(arabicName);
    
    form.setFieldsValue({
      nameAr: arabicName,
      nameEn: englishName
    });
  };

  const handleSubmit = async (values: Record<string, unknown>) => {
    if (!customerId) return;
    
    setLoading(true);
    
    try {
      // تحويل التواريخ إلى strings
      const updateData: Record<string, unknown> = {
        ...values,
        regDate: values.regDate && dayjs.isDayjs(values.regDate) ? values.regDate.format('YYYY-MM-DD') : values.regDate || '',
        startDate: values.startDate && dayjs.isDayjs(values.startDate) ? values.startDate.format('YYYY-MM-DD') : values.startDate || '',
        taxFileExpiry: values.taxFileExpiry && dayjs.isDayjs(values.taxFileExpiry) ? values.taxFileExpiry.format('YYYY-MM-DD') : values.taxFileExpiry || '',
      };

      // إزالة الحقول غير المطلوبة
      if ('docId' in updateData) {
        delete updateData.docId;
      }
      
      await updateDoc(doc(db, "customers", customerId), updateData);
      
      message.success("تم تحديث بيانات العميل بنجاح");
      
      // توجيه المستخدم إلى صفحة دليل العملاء
      setTimeout(() => {
        navigate('/customers/directory');
      }, 1500);
      
    } catch (err) {
      message.error("حدث خطأ أثناء تحديث بيانات العميل");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gray-50 rtl flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
          <p className="mt-4">جاري تحميل بيانات العميل...</p>
        </div>
      </div>
    );
  }

  if (!customerData) {
    return (
      <div className="min-h-screen bg-gray-50 rtl flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <p className="text-red-600 mb-4">لم يتم العثور على بيانات العميل</p>
          <Button 
            type="primary" 
            onClick={() => navigate('/customers/directory')}
            icon={<ArrowRightOutlined />}
          >
            العودة إلى دليل العملاء
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 rtl" dir="rtl">
      <div className="p-6 lg:p-8">
        {/* Header */}
        <div className="p-4 font-['Tajawal'] bg-white mb-4 rounded-lg shadow-sm relative overflow-hidden">
          <div className="flex items-center">
            <EditOutlined className="text-2xl text-green-600 ml-3" />
            <h1 className="text-2xl font-bold text-gray-800">تعديل بيانات العميل</h1>
          </div>
          <p className="text-gray-600 mt-2">تحديث معلومات العميل: {customerData.nameAr}</p>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-blue-500"></div>
        </div>

        <Breadcrumb
          items={[
            { label: "الرئيسية", to: "/" },
            { label: "إدارة المبيعات", to: "/management/sales" },
            { label: "دليل العملاء", to: "/customers/directory" },
            { label: "تعديل العميل" },
          ]}
        />

        {/* Form Card */}
        <Card className="mt-6 shadow-sm" title={`تعديل بيانات العميل - ${customerData.id}`}>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            className="space-y-6"
          >
            <Row gutter={[16, 16]}>
              {/* العمود الأول */}
              <Col xs={24} sm={12} md={6}>
                <Form.Item
                  name="id"
                  label="رقم العميل"
                >
                  <Input disabled style={{ backgroundColor: '#f5f5f5' }} />
                </Form.Item>

                <Form.Item
                  name="nameAr"
                  label="الاسم بالعربي"
                  rules={[{ required: true, message: 'يرجى إدخال الاسم بالعربي' }]}
                >
                  <Input onChange={handleNameArChange} />
                </Form.Item>

                <Form.Item
                  name="nameEn"
                  label="الاسم بالإنجليزي"
                >
                  <Input disabled placeholder="تلقائي" style={{ backgroundColor: '#f5f5f5' }} />
                </Form.Item>

                <Form.Item
                  name="branch"
                  label="الفرع"
                  rules={[{ required: true, message: 'يرجى اختيار الفرع' }]}
                >
                  <Select placeholder="اختر الفرع">
                    {branches.map(branch => (
                      <Select.Option key={branch} value={branch}>{branch}</Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>

              {/* العمود الثاني */}
              <Col xs={24} sm={12} md={6}>
                <Form.Item
                  name="commercialReg"
                  label="السجل التجاري"
                >
                  <Input />
                </Form.Item>

                <Form.Item
                  name="regDate"
                  label="تاريخ السجل"
                >
                  <DatePicker style={{ width: '100%' }} />
                </Form.Item>

                <Form.Item
                  name="regAuthority"
                  label="جهة الإصدار"
                >
                  <Input />
                </Form.Item>

                <Form.Item
                  name="businessType"
                  label="نوع العمل"
                  rules={[{ required: true, message: 'يرجى اختيار نوع العمل' }]}
                >
                  <Select placeholder="اختر نوع العمل">
                    {businessTypes.map(type => (
                      <Select.Option key={type} value={type}>{type}</Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>

              {/* العمود الثالث */}
              <Col xs={24} sm={12} md={6}>
                <Form.Item
                  name="activity"
                  label="النشاط"
                  rules={[{ required: true, message: 'يرجى اختيار النشاط' }]}
                >
                  <Select placeholder="اختر النشاط">
                    {activities.map(activity => (
                      <Select.Option key={activity} value={activity}>{activity}</Select.Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item
                  name="startDate"
                  label="تاريخ بداية التعامل"
                >
                  <DatePicker style={{ width: '100%' }} />
                </Form.Item>

                <Form.Item
                  name="city"
                  label="المدينة"
                  rules={[{ required: true, message: 'يرجى اختيار المدينة' }]}
                >
                  <Select placeholder="اختر المدينة">
                    {cities.map(city => (
                      <Select.Option key={city} value={city}>{city}</Select.Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item
                  name="creditLimit"
                  label="الحد الائتماني (ر.س)"
                >
                  <Input type="number" />
                </Form.Item>
              </Col>

              {/* العمود الرابع */}
              <Col xs={24} sm={12} md={6}>
                <Form.Item
                  name="status"
                  label="الحالة"
                  rules={[{ required: true, message: 'يرجى اختيار الحالة' }]}
                >
                  <Select placeholder="اختر الحالة">
                    {statusOptions.map(status => (
                      <Select.Option key={status} value={status}>{status}</Select.Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item
                  name="mobile"
                  label="رقم الجوال"
                  rules={[{ required: true, message: 'يرجى إدخال رقم الجوال' }]}
                >
                  <Input />
                </Form.Item>

                <Form.Item
                  name="email"
                  label="البريد الإلكتروني"
                  rules={[{ type: 'email', message: 'يرجى إدخال بريد إلكتروني صحيح' }]}
                >
                  <Input />
                </Form.Item>
              </Col>
            </Row>

            {/* تفاصيل الملف الضريبي والعنوان */}
            <Card size="small" title="تفاصيل الملف الضريبي والعنوان" className="mt-4">
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} md={6}>
                  <Form.Item
                    name="taxFileNumber"
                    label="رقم الملف الضريبي"
                  >
                    <Input placeholder="أدخل رقم الملف الضريبي" />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12} md={6}>
                  <Form.Item
                    name="taxFileExpiry"
                    label="تاريخ انتهاء الملف الضريبي"
                  >
                    <DatePicker style={{ width: '100%' }} />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12} md={6}>
                  <Form.Item
                    name="region"
                    label="المنطقة"
                  >
                    <Input />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12} md={6}>
                  <Form.Item
                    name="district"
                    label="الحي"
                  >
                    <Input />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12} md={6}>
                  <Form.Item
                    name="street"
                    label="الشارع"
                  >
                    <Input />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12} md={6}>
                  <Form.Item
                    name="buildingNo"
                    label="رقم المبنى"
                  >
                    <Input />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12} md={6}>
                  <Form.Item
                    name="postalCode"
                    label="الرمز البريدي"
                  >
                    <Input />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12} md={6}>
                  <Form.Item
                    name="phone"
                    label="الهاتف"
                  >
                    <Input />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            {/* Action Buttons */}
            <div className="flex items-center gap-4 pt-4">
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loading}
                icon={<SaveOutlined />}
              >
                حفظ التغييرات
              </Button>
              <Button 
                onClick={() => navigate('/customers/directory')}
                icon={<ArrowRightOutlined />}
              >
                إلغاء
              </Button>
            </div>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default EditCustomerPage;
