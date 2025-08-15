import * as XLSX from "xlsx";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy, addDoc, updateDoc, doc, deleteDoc } from "firebase/firestore";
import { 
  Card, 
  Table, 
  Button, 
  Input, 
  Select, 
  Tag, 
  Space, 
  Popconfirm, 
  Row, 
  Col, 
  Spin,
  Empty,
  Typography,
  message,
  Badge,
  Form,
  DatePicker,
  Layout,
  Upload,
  Pagination
} from 'antd';
import { 
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UploadOutlined,
  LeftOutlined,
  RightOutlined
} from '@ant-design/icons';
import { format } from "date-fns";
import { arSA } from "date-fns/locale";
                                                                                                                                         
const { Title, Text } = Typography;
const { Option } = Select;
const { Content } = Layout;

// أنواع TypeScript
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

const businessTypes = ["شركة", "مؤسسة", "فرد"];
const activities = ["مقاولات", "تجارة تجزئة", "صناعة", "خدمات"];
const cities = ["الرياض", "جدة", "الدمام", "مكة", "الخبر", "الطائف"];
const statusOptions = ["نشط", "متوقف"] as const;

const today = new Date();
const todayStr = format(today, "yyyy-MM-dd");

const initialForm: Customer = {
  id: "",
  nameAr: "",
  nameEn: "",
  branch: "",
  commercialReg: "",
  regDate: todayStr,
  regAuthority: "",
  businessType: "",
  activity: "",
  startDate: "",
  city: "",
  creditLimit: "",
  region: "",
  district: "",
  street: "",
  buildingNo: "",
  postalCode: "",
  countryCode: "SA",
  phone: "",
  mobile: "",
  email: "",
  status: "نشط",
  taxFileNumber: "",
  taxFileExpiry: ""
};

const CustomersPage = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [branches, setBranches] = useState<string[]>([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [form, setForm] = useState<Customer>(initialForm);
  const [isEditing, setIsEditing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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

  // توزيع العملاء عشوائياً على الفروع
  const handleDistributeBranches = async () => {
    if (customers.length === 0) return;
    setLoading(true);
    try {
      const updates = customers.map(async (customer) => {
        const randomBranch = branches[Math.floor(Math.random() * branches.length)];
        if (customer.docId) {
          await updateDoc(doc(db, "customers", customer.docId), { branch: randomBranch });
        }
      });
      await Promise.all(updates);
      message.success("تم توزيع العملاء عشوائياً على الفروع");
      fetchCustomers();
    } catch (err) {
      message.error("حدث خطأ أثناء توزيع العملاء");
    } finally {
      setLoading(false);
    }
  };

  // دالة استيراد العملاء من ملف Excel
  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json<Record<string, string>>(sheet, { defval: "" });

      let maxNum = customers
        .map(c => {
          const match = /^c-(\d{4})$/.exec(c.id);
          return match ? parseInt(match[1], 10) : 0;
        })
        .reduce((a, b) => Math.max(a, b), 0);

      let addedCount = 0;
      for (const row of rows) {
        const customer: Partial<Customer> = {
          nameAr: row["اسم العميل"] || row["اسم العميل "] || row["الاسم بالعربي"] || "",
          branch: row["الفرع"] || "",
          commercialReg: row["رقم البطاقة / الهوية"] || row["السجل التجاري"] || "",
          regDate: row["تاريخ إصدار البطاقة / الهوية"] || row["تاريخ السجل"] || todayStr,
          regAuthority: row["الجهة المُصدرة للهوية"] || row["جهة الإصدار"] || "",
          businessType: row["نوع العميل"] || row["نوع العمل"] || "",
          activity: row["مجال الصناعة"] || row["النشاط"] || "",
          startDate: row["تاريخ الإنشاء"] || row["تاريخ بداية التعامل"] || "",
          city: row["المدينة"] || "",
          creditLimit: row["الحد الائتماني"] || "",
          region: row["المنطقة"] || "",
          district: row["الحي"] || "",
          street: row["الشارع"] || "",
          buildingNo: row["رقم المبنى"] || "",
          postalCode: row["الرمز البريدي"] || "",
          countryCode: row["كود الدولة"] || "SA",
          phone: row["الهاتف"] || row["رقم التليفون"] || "",
          mobile: row["المحمول"] || row["موبايل الكفيل"] || row["موبايل"] || "",
          email: row["البريد الإلكتروني"] || row["بريد إلكتروني إضافي"] || "",
          status: row["اسم الحالة"] === "متوقف" ? "متوقف" : "نشط",
          taxFileNumber: row["رقم الملف الضريبي"] || "",
          taxFileExpiry: row["تاريخ انتهاء الملف الضريبي"] || "",
        };
        customer.nameEn = arabicToEnglish(customer.nameAr || "");
        maxNum++;
        customer.id = `c-${maxNum.toString().padStart(4, "0")}`;
        
        await addDoc(collection(db, "customers"), {
          ...initialForm,
          ...customer,
          createdAt: new Date().toISOString(),
        });
        addedCount++;
      }
      message.success(`تم استيراد ${addedCount} عميل بنجاح`);
      fetchCustomers();
    } catch (err) {
      message.error("حدث خطأ أثناء استيراد الملف");
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

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
      setError("تعذر تحميل العملاء");
      message.error("حدث خطأ أثناء جلب بيانات العملاء");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  // تحويل الاسم العربي إلى إنجليزي بشكل منطوق
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === "nameAr") {
      setForm(prev => ({
        ...prev,
        nameAr: value,
        nameEn: !prev.nameEn || prev.nameEn === arabicToEnglish(prev.nameAr) 
          ? arabicToEnglish(value) 
          : prev.nameEn
      }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSelectChange = (name: keyof Customer, value: string) => {
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setForm(initialForm);
    setIsEditing(false);
    setShowForm(false);
  };

  const handleEdit = (customer: Customer) => {
    setForm(customer);
    setIsEditing(true);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (docId: string) => {
    try {
      await deleteDoc(doc(db, "customers", docId));
      message.success("تم حذف العميل بنجاح");
      fetchCustomers();
    } catch (error) {
      message.error("حدث خطأ أثناء حذف العميل");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (isEditing && form.docId) {
        const { docId, ...updateData } = form;
        await updateDoc(doc(db, "customers", form.docId), updateData);
        message.success("تم تحديث بيانات العميل بنجاح");
      } else {
        const maxNum = customers
          .map(c => {
            const match = /^c-(\d{4})$/.exec(c.id);
            return match ? parseInt(match[1], 10) : 0;
          })
          .reduce((a, b) => Math.max(a, b), 0);
        const nextNum = maxNum + 1;
        const newId = `c-${nextNum.toString().padStart(4, '0')}`;

        await addDoc(collection(db, "customers"), { 
          ...form, 
          id: newId,
          createdAt: new Date().toISOString()
        });
        message.success("تم إضافة العميل بنجاح");
      }
      
      fetchCustomers();
      resetForm();
    } catch (err) {
      message.error("حدث خطأ أثناء حفظ البيانات");
    } finally {
      setLoading(false);
    }
  };

  // تصفية العملاء حسب البحث
  const filteredCustomers = customers.filter(customer =>
    Object.values(customer).some(
      value => value && 
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // ترقيم الصفحات
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const paginatedCustomers = filteredCustomers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    try {
      return format(new Date(dateStr), "dd/MM/yyyy", { locale: arSA });
    } catch {
      return dateStr;
    }
  };

  // Define table columns for Ant Design
  const tableColumns = [
    {
      title: 'رقم العميل',
      dataIndex: 'id',
      key: 'id',
      width: 120,
    },
    {
      title: 'الاسم بالعربي',
      dataIndex: 'nameAr',
      key: 'nameAr',
      render: (text: string) => <Text strong>{text}</Text>,
    },
    {
      title: 'الاسم بالإنجليزي',
      dataIndex: 'nameEn',
      key: 'nameEn',
      render: (text: string) => <Text type="secondary">{text}</Text>,
    },
    {
      title: 'الفرع',
      dataIndex: 'branch',
      key: 'branch',
    },
    {
      title: 'السجل التجاري',
      dataIndex: 'commercialReg',
      key: 'commercialReg',
    },
    {
      title: 'تاريخ السجل',
      dataIndex: 'regDate',
      key: 'regDate',
      render: (date: string) => formatDate(date),
    },
    {
      title: 'نوع العمل',
      dataIndex: 'businessType',
      key: 'businessType',
    },
    {
      title: 'الحالة',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === "نشط" ? "green" : "red"}>
          {status}
        </Tag>
      ),
    },
    {
      title: 'الإجراءات',
      key: 'actions',
      width: 120,
      render: (_: unknown, record: Customer) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            title="تعديل"
          />
          <Popconfirm
            title="حذف العميل"
            description="هل أنت متأكد من حذف هذا العميل؟"
            onConfirm={() => record.docId && handleDelete(record.docId)}
            okText="نعم"
            cancelText="لا"
          >
            <Button
              type="text"
              icon={<DeleteOutlined />}
              danger
              title="حذف"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }} dir="rtl">
      <div style={{ marginBottom: 32 }}>
        <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
          <Col>
            <Title level={2}>إدارة العملاء</Title>
          </Col>
          <Col>
            <Space wrap>
              <Button onClick={handleDistributeBranches}>
                توزيع عشوائي على الفروع
              </Button>
              <Input
                placeholder="ابحث عن عميل..."
                prefix={<SearchOutlined />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: 250 }}
              />
              <Button 
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => { resetForm(); setShowForm(true); }}
              >
                عميل جديد
              </Button>
              <Button 
                icon={<UploadOutlined />}
                onClick={() => fileInputRef.current?.click()}
              >
                استيراد من Excel
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  style={{ display: 'none' }}
                  onChange={handleImportExcel}
                />
              </Button>
            </Space>
          </Col>
        </Row>

        {/* Customer Form Card */}
        {(showForm || isEditing) && (
          <Card style={{ marginBottom: 24 }}>
            <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
              <Col>
                <Title level={4}>
                  {isEditing ? "تعديل بيانات العميل" : "إضافة عميل جديد"}
                </Title>
              </Col>
              <Col>
                <Button onClick={resetForm}>
                  {isEditing ? "إلغاء التعديل" : "مسح النموذج"}
                </Button>
              </Col>
            </Row>

            <form onSubmit={handleSubmit}>
              <Row gutter={[16, 16]}>
                {/* العمود الأول */}
                <Col xs={24} sm={12} md={6}>
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', marginBottom: 8 }}>رقم العميل</label>
                    <Input
                      name="id"
                      value={form.id}
                      placeholder="تلقائي"
                      disabled
                    />
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', marginBottom: 8 }}>الاسم بالعربي*</label>
                    <Input 
                      name="nameAr" 
                      value={form.nameAr} 
                      onChange={handleChange} 
                      required 
                    />
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', marginBottom: 8 }}>الاسم بالإنجليزي</label>
                    <Input
                      name="nameEn"
                      value={form.nameEn}
                      placeholder="تلقائي"
                      disabled
                    />
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', marginBottom: 8 }}>الفرع*</label>
                    <Select 
                      value={form.branch} 
                      onChange={(value) => handleSelectChange("branch", value)}
                      placeholder="اختر الفرع"
                      style={{ width: '100%' }}
                    >
                      {branches.map(branch => (
                        <Option key={branch} value={branch}>{branch}</Option>
                      ))}
                    </Select>
                  </div>
                </Col>

                {/* العمود الثاني */}
                <Col xs={24} sm={12} md={6}>
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', marginBottom: 8 }}>السجل التجاري</label>
                    <Input 
                      name="commercialReg" 
                      value={form.commercialReg} 
                      onChange={handleChange} 
                    />
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', marginBottom: 8 }}>تاريخ السجل</label>
                    <Input 
                      name="regDate" 
                      value={form.regDate} 
                      onChange={handleChange} 
                      type="date" 
                    />
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', marginBottom: 8 }}>جهة الإصدار</label>
                    <Input 
                      name="regAuthority" 
                      value={form.regAuthority} 
                      onChange={handleChange} 
                    />
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', marginBottom: 8 }}>نوع العمل*</label>
                    <Select 
                      value={form.businessType} 
                      onChange={(value) => handleSelectChange("businessType", value)}
                      placeholder="اختر نوع العمل"
                      style={{ width: '100%' }}
                    >
                      {businessTypes.map(type => (
                        <Option key={type} value={type}>{type}</Option>
                      ))}
                    </Select>
                  </div>
                </Col>

                {/* العمود الثالث */}
                <Col xs={24} sm={12} md={6}>
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', marginBottom: 8 }}>النشاط*</label>
                    <Select 
                      value={form.activity} 
                      onChange={(value) => handleSelectChange("activity", value)}
                      placeholder="اختر النشاط"
                      style={{ width: '100%' }}
                    >
                      {activities.map(activity => (
                        <Option key={activity} value={activity}>{activity}</Option>
                      ))}
                    </Select>
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', marginBottom: 8 }}>تاريخ بداية التعامل</label>
                    <Input 
                      name="startDate" 
                      value={form.startDate} 
                      onChange={handleChange} 
                      type="date" 
                    />
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', marginBottom: 8 }}>المدينة*</label>
                    <Select 
                      value={form.city} 
                      onChange={(value) => handleSelectChange("city", value)}
                      placeholder="اختر المدينة"
                      style={{ width: '100%' }}
                    >
                      {cities.map(city => (
                        <Option key={city} value={city}>{city}</Option>
                      ))}
                    </Select>
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', marginBottom: 8 }}>الحد الائتماني (ر.س)</label>
                    <Input 
                      name="creditLimit" 
                      value={form.creditLimit} 
                      onChange={handleChange} 
                      type="number" 
                    />
                  </div>
                </Col>

                {/* العمود الرابع */}
                <Col xs={24} sm={12} md={6}>
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', marginBottom: 8 }}>الحالة*</label>
                    <Select 
                      value={form.status} 
                      onChange={(value) => handleSelectChange("status", value)}
                      placeholder="اختر الحالة"
                      style={{ width: '100%' }}
                    >
                      {statusOptions.map(status => (
                        <Option key={status} value={status}>{status}</Option>
                      ))}
                    </Select>
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', marginBottom: 8 }}>رقم الجوال*</label>
                    <Input.Group compact>
                      <Input 
                        name="countryCode" 
                        value={form.countryCode} 
                        onChange={handleChange} 
                        style={{ width: '25%' }}
                      />
                      <Input 
                        name="mobile" 
                        value={form.mobile} 
                        onChange={handleChange} 
                        style={{ width: '75%' }}
                        required
                      />
                    </Input.Group>
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', marginBottom: 8 }}>البريد الإلكتروني</label>
                    <Input 
                      name="email" 
                      value={form.email} 
                      onChange={handleChange} 
                      type="email" 
                    />
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <Space>
                      <Button 
                        type="primary" 
                        htmlType="submit" 
                        loading={loading}
                      >
                        {isEditing ? "حفظ التعديلات" : "حفظ العميل"}
                      </Button>
                      <Button onClick={resetForm}>
                        إلغاء
                      </Button>
                    </Space>
                  </div>
                </Col>
              </Row>

              {/* تفاصيل الملف الضريبي والعنوان */}
              <Card size="small" title="تفاصيل الملف الضريبي والعنوان" style={{ marginTop: 16 }}>
                <Row gutter={[16, 16]}>
                  <Col xs={24} sm={12} md={6}>
                    <label style={{ display: 'block', marginBottom: 8 }}>رقم الملف الضريبي</label>
                    <Input
                      name="taxFileNumber"
                      value={form.taxFileNumber}
                      onChange={handleChange}
                      placeholder="أدخل رقم الملف الضريبي"
                    />
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <label style={{ display: 'block', marginBottom: 8 }}>تاريخ انتهاء الملف الضريبي</label>
                    <Input
                      name="taxFileExpiry"
                      value={form.taxFileExpiry}
                      onChange={handleChange}
                      type="date"
                    />
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <label style={{ display: 'block', marginBottom: 8 }}>المنطقة</label>
                    <Input 
                      name="region" 
                      value={form.region} 
                      onChange={handleChange} 
                    />
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <label style={{ display: 'block', marginBottom: 8 }}>الحي</label>
                    <Input 
                      name="district" 
                      value={form.district} 
                      onChange={handleChange} 
                    />
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <label style={{ display: 'block', marginBottom: 8 }}>الشارع</label>
                    <Input 
                      name="street" 
                      value={form.street} 
                      onChange={handleChange} 
                    />
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <label style={{ display: 'block', marginBottom: 8 }}>رقم المبنى</label>
                    <Input 
                      name="buildingNo" 
                      value={form.buildingNo} 
                      onChange={handleChange} 
                    />
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <label style={{ display: 'block', marginBottom: 8 }}>الرمز البريدي</label>
                    <Input 
                      name="postalCode" 
                      value={form.postalCode} 
                      onChange={handleChange} 
                    />
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <label style={{ display: 'block', marginBottom: 8 }}>رقم التليفون</label>
                    <Input 
                      name="phone" 
                      value={form.phone} 
                      onChange={handleChange} 
                    />
                  </Col>
                </Row>
              </Card>
            </form>
          </Card>
        )}

        {/* Customers Table */}
        <Card>
          <Table
            columns={tableColumns}
            dataSource={paginatedCustomers}
            rowKey="id"
            loading={loading}
            pagination={false}
            scroll={{ x: 800 }}
            locale={{
              emptyText: (
                <Empty
                  description="لا يوجد عملاء"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              )
            }}
          />

          {/* Pagination */}
          {filteredCustomers.length > itemsPerPage && (
            <div style={{ marginTop: 16, textAlign: 'center' }}>
              <Pagination
                current={currentPage}
                total={filteredCustomers.length}
                pageSize={itemsPerPage}
                onChange={setCurrentPage}
                showSizeChanger={false}
                showQuickJumper
                showTotal={(total, range) => 
                  `عرض ${range[0]}-${range[1]} من ${total} عميل`
                }
              />
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default CustomersPage;
