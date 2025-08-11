import { fetchCashBoxes, CashBox } from '@/services/cashBoxesService';
import { fetchBankAccounts, BankAccount } from '@/services/bankAccountsService';
import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Table } from 'antd';
// استيراد دالة جلب الحسابات (يفترض وجودها)
import { getAccounts } from '@/services/accountsService';
import { Modal } from 'antd';
import { fetchBranches, Branch } from '@/lib/branches';
import { useFinancialYear } from '@/hooks/useFinancialYear';
import styles from './ReceiptVoucher.module.css';
import {
  Card,
  Row,
  Col,
  DatePicker,
  Input,
  Select,
  Button,
  Form,
  InputNumber,
  Upload,
  Space,
  Divider,
  Typography
} from 'antd';
import dayjs from 'dayjs';
import { GiMagicBroom } from 'react-icons/gi';
import { UploadOutlined, ReloadOutlined, MoneyCollectOutlined } from '@ant-design/icons';
import Breadcrumb from '../../components/Breadcrumb';
import type { UploadFile } from 'antd/es/upload/interface';
import type { Dayjs } from 'dayjs';
import { numberToArabicWords } from '../../utils/numberToWords';

const { RangePicker } = DatePicker;
const { Option } = Select;
const { Title } = Typography;

interface ReceiptVoucherForm {
  dateRange: [Dayjs, Dayjs] | null;
  entryNumber: string;
  voucherNumber: string;
  date: Dayjs | null;
  currency: string;
  exchangeRate: number;
  amount: number;
  amountInWords: string;
  branch: string;
  receivedFrom: string;
  debitAccount: string;
  accountNumber: string;
  accountName: string;
  costCenter: string;
  costCenterNumber: string;
  collectorNumber: string;
  collector: string;
  paymentMethod: string;
  bookNumber: string;
  cashboxBank: string;
  checkTransferNumber: string;
  checkTransferDate: Dayjs | null;
  bankSelection: string;
  description: string;
}

const ReceiptVoucher: React.FC = () => {

  const [cashboxBankOptions, setCashboxBankOptions] = React.useState<{ value: string; label: string; type: 'cashbox' | 'bank' }[]>([]);
  // State for showing modals
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [showCollectorModal, setShowCollectorModal] = useState(false);
  const [collectorSearch, setCollectorSearch] = useState('');
  // بيانات المحصلين من صفحة المندوبين (salesRepresentatives)
  const [collectorAccounts, setCollectorAccounts] = useState<{ number: string; name: string; mobile?: string; id: string }[]>([]);

  useEffect(() => {
    // جلب بيانات المندوبين من قاعدة البيانات
    const fetchCollectors = async () => {
      try {
        const repsSnapshot = await getDocs(collection(db, 'salesRepresentatives'));
        const reps = repsSnapshot.docs.map((doc, idx) => {
          const data = doc.data();
          return {
            id: doc.id, // معرف داخلي
            number: (idx + 1).toString(), // رقم تسلسلي
            name: data.name || '',
            mobile: data.phone || ''
          };
        });
        setCollectorAccounts(reps);
      } catch (error) {
        setCollectorAccounts([]);
      }
    };
    fetchCollectors();
  }, []);

  // بيانات حسابات العملاء والموردين من دليل الحسابات (linkedToPage)
  const [customerAccounts, setCustomerAccounts] = useState<{ code: string; nameAr: string; mobile?: string; taxNumber?: string }[]>([]);
  const [supplierAccounts, setSupplierAccounts] = useState<{ code: string; nameAr: string; mobile?: string }[]>([]);
  const [customerSearch, setCustomerSearch] = useState('');
  const [supplierSearch, setSupplierSearch] = useState('');

  useEffect(() => {
    if (showCustomerModal) {
      getAccounts()
        .then((accounts) => {
          // العملاء من linkedToPage === 'customers'
          const customers = accounts.filter(acc => acc.linkedToPage === 'customers');
          setCustomerAccounts(customers.map(acc => ({
            code: acc.code,
            nameAr: acc.nameAr,
            mobile: acc.customerData?.mobile || acc.customerData?.phone || '',
            taxNumber: acc.customerData?.taxFileNumber || ''
          })));
        })
        .catch(() => setCustomerAccounts([]));
    }
  }, [showCustomerModal]);

  useEffect(() => {
    if (showSupplierModal) {
      getAccounts()
        .then((accounts: any[]) => {
          // الموردين من linkedToPage === 'suppliers'
          const suppliers = accounts.filter(acc => acc.linkedToPage === 'suppliers');
          setSupplierAccounts(suppliers.map(acc => ({
            code: acc.code,
            nameAr: acc.nameAr,
            mobile: acc.supplierData?.mobile || acc.supplierData?.phone || ''
          })));
        })
        .catch(() => setSupplierAccounts([]));
    }
  }, [showSupplierModal]);
  React.useEffect(() => {
    async function loadCashboxBankOptions() {
      try {
        const [cashBoxes, bankAccounts] = await Promise.all([
          fetchCashBoxes(),
          fetchBankAccounts()
        ]);
        const cashboxOptions = cashBoxes.map(cb => ({
          value: `cashbox-${cb.id}`,
          label: `صندوق: ${cb.nameAr}`,
          type: 'cashbox' as const
        }));
        const bankOptions = bankAccounts.map(bk => ({
          value: `bank-${bk.id}`,
          label: `بنك: ${bk.arabicName}`,
          type: 'bank' as const
        }));
        setCashboxBankOptions([...cashboxOptions, ...bankOptions]);
      } catch (e) {
        // يمكن إضافة رسالة خطأ إذا لزم الأمر
      }
    }
    loadCashboxBankOptions();
  }, []);

  const [form] = Form.useForm<ReceiptVoucherForm>();
  // State to force re-render on payment method change
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  // توليد رقم قيد تلقائي (مثال: رقم عشوائي أو متسلسل)
  const generateEntryNumber = () => {
    // يمكن استبداله بمنطق أكثر تعقيداً لاحقاً
    return `EN-${Date.now().toString().slice(-6)}`;
  };
  // توليد رقم سند تلقائي
  const generateVoucherNumber = () => {
    return `VN-${Date.now().toString().slice(-6)}`;
  };
  const [autoEntryNumber, setAutoEntryNumber] = useState<string>(generateEntryNumber());
  const [autoVoucherNumber, setAutoVoucherNumber] = useState<string>(generateVoucherNumber());
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [amountInWords, setAmountInWords] = useState<string>('');
  const [selectedCurrency, setSelectedCurrency] = useState<string>('SAR');


  // State for selected debit account
  const [selectedDebitAccount, setSelectedDebitAccount] = useState<string>('');

  // مراقبة تغيير المبلغ وتحديث المبلغ مكتوباً
  const handleAmountChange = (value: number | null) => {
    if (value && value > 0) {
      const wordsText = numberToArabicWords(value, selectedCurrency);
      setAmountInWords(wordsText);
      form.setFieldValue('amountInWords', wordsText);
    } else {
      setAmountInWords('');
      form.setFieldValue('amountInWords', '');
    }
  };

  // مراقبة تغيير العملة وتحديث المبلغ مكتوباً
  const handleCurrencyChange = (currency: string) => {
    setSelectedCurrency(currency);
    const currentAmount = form.getFieldValue('amount');
    if (currentAmount && currentAmount > 0) {
      const wordsText = numberToArabicWords(currentAmount, currency);
      setAmountInWords(wordsText);
      form.setFieldValue('amountInWords', wordsText);
    }
  };

  // إضافة تأثير reset للمبلغ مكتوب عند تفريغ النموذج
  const handleFormReset = () => {
    form.resetFields();
    setAmountInWords('');
    setSelectedCurrency('EGP');
    // إعادة توليد رقم القيد والسند عند التفريغ
    const newEntry = generateEntryNumber();
    const newVoucher = generateVoucherNumber();
    setAutoEntryNumber(newEntry);
    setAutoVoucherNumber(newVoucher);
    form.setFieldValue('entryNumber', newEntry);
    form.setFieldValue('voucherNumber', newVoucher);
  };


const handleFormSubmit = async (values: ReceiptVoucherForm) => {
  try {
    // تحويل الحقول من نوع Dayjs إلى نصوص أو null
    const safeDate = values.date ? (values.date as Dayjs).toISOString() : null;
    const safeCheckTransferDate = values.checkTransferDate ? (values.checkTransferDate as Dayjs).toISOString() : null;
    const safeDateRange = Array.isArray(values.dateRange) && values.dateRange.length === 2
      ? [
          values.dateRange[0] ? (values.dateRange[0] as Dayjs).toISOString() : null,
          values.dateRange[1] ? (values.dateRange[1] as Dayjs).toISOString() : null
        ]
      : null;
    // إزالة undefined من جميع الحقول (تحويلها إلى null)
    const cleanValues = Object.fromEntries(
      Object.entries({
        ...values,
        date: safeDate,
        checkTransferDate: safeCheckTransferDate,
        dateRange: safeDateRange,
        createdAt: new Date().toISOString(),
        attachments: fileList.map(f => ({ name: f.name, url: f.url || '', status: f.status })),
      }).map(([k, v]) => [k, v === undefined ? null : v])
    );
    const dataToSave = cleanValues;
    // إضافة السند إلى مجموعة receiptVouchers
    await addDoc(collection(db, 'receiptVouchers'), dataToSave);
    // رسالة نجاح
    Modal.success({
      title: 'تمت الإضافة بنجاح',
      content: 'تم حفظ سند القبض في قاعدة البيانات.',
    });
    handleFormReset();
  } catch (error) {
    Modal.error({
      title: 'خطأ في الإضافة',
      content: 'حدث خطأ أثناء حفظ السند. حاول مرة أخرى.',
    });
    console.error('Firebase add error:', error);
  }
};

  const handleGetLastNumber = () => {
    // Logic to get last voucher number
    console.log('Getting last voucher number...');
  };

  const handleFileChange = ({ fileList: newFileList, file, event }: { fileList: UploadFile[]; file: unknown; event: unknown }) => {
    console.log('=== handleFileChange CALLED ===');
    console.log({ newFileList, file, event });
    try {
      setFileList(newFileList);
    } catch (err) {
      // طباعة الخطأ في الكونسول
      console.error('File upload error:', err, { file, event, newFileList });
    }
  };

  // طباعة في الكونسول عند بداية beforeUpload
  const handleBeforeUpload = (file: unknown, fileList: unknown) => {
    console.log('=== beforeUpload CALLED ===');
    console.log({ file, fileList });
    // تجربة طباعة window وdocument للتأكد من أن الكود يعمل في المتصفح
    if (typeof window !== 'undefined') {
      console.log('window موجود');
    } else {
      console.warn('window غير موجود');
    }
    if (typeof document !== 'undefined') {
      console.log('document موجود');
    } else {
      console.warn('document غير موجود');
    }
    return false;
  };

  const currencyOptions = [
    { value: 'EGP', label: 'جنيه مصري', symbol: '£', color: '#16a085' },
    { value: 'USD', label: 'دولار أمريكي', symbol: '$', color: '#27ae60' },
    { value: 'EUR', label: 'يورو', symbol: '€', color: '#3498db' },
    { value: 'SAR', label: 'ريال سعودي', symbol: '﷼', color: '#8e44ad' }
  ];

  // قائمة الفروع الحقيقية
  const [branchOptions, setBranchOptions] = useState<{ value: string; label: string }[]>([]);
  useEffect(() => {
    async function loadBranches() {
      try {
        const branches: Branch[] = await fetchBranches();
        setBranchOptions(
          branches.map((b) => ({ value: b.id || b.code, label: b.name }))
        );
      } catch (err) {
        setBranchOptions([]);
      }
    }
    loadBranches();
  }, []);

  const receivedFromOptions = [
    { value: 'customer1', label: 'عميل 1' },
    { value: 'customer2', label: 'عميل 2' },
    { value: 'supplier1', label: 'مورد 1' },
    { value: 'employee1', label: 'موظف 1' }
  ];

  const accountOptions = [

    { value: 'acc3', label: 'حساب العملاء' },
    { value: 'acc4', label: 'حساب الموردين' }
  ];

  const paymentMethodOptions = [
    { value: 'cash', label: 'نقدي' },
    { value: 'network', label: 'شبكة' },
    { value: 'transfer', label: 'تحويل بنكي' }
  ];

  // خيارات البنوك من قاعدة البيانات
  const [bankOptions, setBankOptions] = useState<{ value: string; label: string }[]>([]);
  useEffect(() => {
    async function loadBanks() {
      try {
        const banks: BankAccount[] = await fetchBankAccounts();
        setBankOptions(
          banks.map((b) => ({ value: b.id || b.arabicName, label: b.arabicName }))
        );
      } catch (err) {
        setBankOptions([]);
      }
    }
    loadBanks();
  }, []);

  // Custom style for larger and clearer controls
  const largeControlStyle = {
    height: 48,
    fontSize: 18,
    borderRadius: 8,
    padding: '8px 16px',
    boxShadow: '0 1px 6px rgba(0,0,0,0.07)',
    background: '#fff',
    border: '1.5px solid #d9d9d9',
    transition: 'border-color 0.3s',
  };

  // Custom style for label font size
  const labelStyle = { fontSize: 18, fontWeight: 500 };
  // Handle debit account change
  const handleDebitAccountChange = (value: string) => {
    setSelectedDebitAccount(value);
    form.setFieldValue('debitAccount', value);
    // Clear account number and name when debit account changes
    form.setFieldsValue({ accountNumber: '', accountName: '' });
  };

  // Handle account name button click
  const handleAccountNameButtonClick = () => {
    if (selectedDebitAccount === 'acc3') {
      // حساب العملاء
      setShowCustomerModal(true);
    } else if (selectedDebitAccount === 'acc4') {
      // حساب الموردين
      setShowSupplierModal(true);
    }
  };

  // Handle collector number button click
  const handleCollectorNumberButtonClick = () => {
    setShowCollectorModal(true);
  };


  // Get today's date using dayjs
  const today = dayjs();

  // جلب السنة المالية الحالية من السياق (ضع الاستيراد في الأعلى)
  // import { useFinancialYear } from "@/hooks/useFinancialYear"; (تم نقله للأعلى)
  // احسب الفترة المحاسبية بناءً على السنة المالية المختارة

  const { currentFinancialYear } = useFinancialYear();
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
  useEffect(() => {
    if (currentFinancialYear) {
      const start = dayjs(currentFinancialYear.startDate);
      const end = dayjs(currentFinancialYear.endDate);
      setDateRange([start, end]);
      form.setFieldValue('dateRange', [start, end]);
    }
  }, [currentFinancialYear, form]);
  // عند تحميل الصفحة، عيّن رقم القيد والسند تلقائياً
  useEffect(() => {
    form.setFieldValue('entryNumber', autoEntryNumber);
    form.setFieldValue('voucherNumber', autoVoucherNumber);
  }, [autoEntryNumber, autoVoucherNumber, form]);

  // Ensure payment method is always in sync for conditional rendering
  useEffect(() => {
    setSelectedPaymentMethod(form.getFieldValue('paymentMethod') || '');
  }, [form]);

  return (
    <>
      <div style={{ padding: '24px' }}>
      {/* Page Header */}
      <div className="p-4 font-['Tajawal'] bg-white mb-4 rounded-lg shadow-[0_0_10px_rgba(0,0,0,0.1)] relative overflow-hidden">
        <div className="flex items-center">
          <MoneyCollectOutlined className="text-2xl text-blue-600 ml-3" />
          <h1 className="text-2xl font-bold text-gray-800">إضافة سند جديد</h1>
        </div>
        <p className="text-gray-600 mt-2">قم بإضافة سند قبض جديد إلى النظام</p>
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-blue-500"></div>
      </div>

      {/* Breadcrumb Navigation */}
      <Breadcrumb
        items={[
          { label: "الرئيسية", to: "/" },
          { label: "ادراة المبيعات", to: "/management/sales" },
          { label: "إضافة سند جديد" }
        ]}
      />

      <Card style={{ width: '100%' }}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFormSubmit}
          initialValues={{
            exchangeRate: 1,
            currency: 'SAR',
            date: today
          }}
        >
          {/* الصف الأول: الفترة المحاسبية، رقم القيد، رقم السند */}
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label={<span style={labelStyle}>الفترة المحاسبية</span>}
                name="dateRange"
                rules={[{ required: true, message: 'يرجى اختيار الفترة المحاسبية' }]}
              >
                <RangePicker
                  style={{ width: '100%', ...largeControlStyle }}
                  placeholder={['من تاريخ', 'إلى تاريخ']}
                  size="large"
                  value={dateRange}
                  onChange={(range) => setDateRange(range)}
                  disabled
                />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                label={<span style={labelStyle}>رقم القيد</span>}
                name="entryNumber"
                rules={[{ required: true, message: 'يرجى إدخال رقم القيد' }]}
              >
                <Input
                  placeholder="رقم القيد"
                  style={{ ...largeControlStyle, background: '#f3f4f6', color: '#64748b', cursor: 'not-allowed' }}
                  size="large"
                  readOnly
                  value={autoEntryNumber}
                />
              </Form.Item>
            </Col>
            <Col span={5}>
              <Form.Item
                label={<span style={labelStyle}>رقم السند</span>}
                name="voucherNumber"
                rules={[{ required: true, message: 'يرجى إدخال رقم السند' }]}
              >
                <Input
                  placeholder="رقم السند"
                  style={{ ...largeControlStyle, background: '#f3f4f6', color: '#64748b', cursor: 'not-allowed' }}
                  size="large"
                  readOnly
                  value={autoVoucherNumber}
                />
              </Form.Item>
            </Col>
                        <Col span={4}>
              <Form.Item
                label={<span style={labelStyle}>الرقم الدفتري</span>}
                name="bookNumber"
              >
                <Input placeholder="الرقم الدفتري" style={largeControlStyle} size="large" />
              </Form.Item>
            </Col>
                        <Col span={1}>
              <Form.Item label={<span style={labelStyle}> </span>}>
                <Button 
                  type="primary" 
                  icon={<ReloadOutlined />}
                  onClick={handleGetLastNumber}
                  style={{ width: '100%', height: 48, fontSize: 18, borderRadius: 8 }}
                  size="large"
                >
             
                </Button>
              </Form.Item>
            </Col>
          </Row>

          {/* الصف الثاني: التاريخ، العملة، التعادل، المبلغ، المبلغ مكتوب، الفرع */}
<Row gutter={16}>
  <Col span={24}>
    <div style={{ display: 'flex', gap: 16, alignItems: 'flex-end' }}>
      <Form.Item
        label={<span style={labelStyle}>التاريخ</span>}
        name="date"
        rules={[{ required: true, message: 'يرجى اختيار التاريخ' }]}
        style={{ flex: 1 }}
      >
        <DatePicker style={{ width: '100%', ...largeControlStyle }} placeholder="التاريخ" size="large" />
      </Form.Item>
      <Form.Item
        label={<span style={labelStyle}>العملة</span>}
        name="currency"
        rules={[{ required: true, message: 'يرجى اختيار العملة' }]}
        style={{ flex: 1 }}
      >
        <Select
          placeholder="العملة"
          style={largeControlStyle}
          size="large"
          dropdownStyle={{ fontSize: 18 }}
          className={styles.noAntBorder}
          onChange={handleCurrencyChange}
        >
          {currencyOptions.map(option => (
            <Option key={option.value} value={option.value}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ 
                  color: option.color, 
                  fontWeight: 'bold',
                  fontSize: 16,
                  minWidth: 20,
                  textAlign: 'center'
                }}>
                  {option.symbol}
                </span>
                {option.label}
              </span>
            </Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item
        label={<span style={labelStyle}>التعادل</span>}
        name="exchangeRate"
        rules={[{ required: true, message: 'يرجى إدخال التعادل' }]}
        style={{ flex: 1 }}
      >
        <InputNumber
          style={{ width: '100%', ...largeControlStyle }}
          placeholder="التعادل"
          min={0}
          step={0.01}
          size="large"
        />
      </Form.Item>
    </div>
  </Col>
</Row>
<Row gutter={16} style={{ marginTop: 8 }}>
  <Col span={24}>
    <div style={{ display: 'flex', gap: 16, alignItems: 'flex-end' }}>
      <Form.Item
        label={
          <span style={labelStyle}>
            المبلغ
            {selectedCurrency && (
              <span style={{ 
                marginRight: 8, 
                color: currencyOptions.find(c => c.value === selectedCurrency)?.color || '#3b82f6',
                fontSize: 16 
              }}>
                ({currencyOptions.find(c => c.value === selectedCurrency)?.symbol})
              </span>
            )}
          </span>
        }
        name="amount"
        rules={[{ required: true, message: 'يرجى إدخال المبلغ' }]}
        style={{ flex: 1 }}
      >
        <InputNumber
          style={{ 
            width: '100%', 
            ...largeControlStyle,
            borderColor: amountInWords 
              ? currencyOptions.find(c => c.value === selectedCurrency)?.color || '#4caf50' 
              : '#d9d9d9',
            boxShadow: amountInWords 
              ? `0 2px 8px ${currencyOptions.find(c => c.value === selectedCurrency)?.color || '#4caf50'}33` 
              : '0 1px 6px rgba(0,0,0,0.07)'
          }}
          placeholder="المبلغ"
          min={0}
          step={0.01}
          size="large"
          onChange={handleAmountChange}
          formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
          parser={(value) => Number(value!.replace(/\$\s?|(,*)/g, ''))}
        />
      </Form.Item>
      <Form.Item
        label={
          <span style={labelStyle}>
            المبلغ مكتوب
            {selectedCurrency && (
              <span style={{ 
                marginRight: 8, 
                color: currencyOptions.find(c => c.value === selectedCurrency)?.color || '#3b82f6',
                fontSize: 16 
              }}>
                ({currencyOptions.find(c => c.value === selectedCurrency)?.symbol})
              </span>
            )}
          </span>
        }
        name="amountInWords"
        style={{ flex: 1 }}
      >
        <Input.TextArea 
          placeholder="سيظهر المبلغ مكتوباً هنا تلقائياً عند إدخال المبلغ والعملة" 
          readOnly 
          value={amountInWords}
          className={amountInWords ? styles.amountHighlight : styles.amountInWords}
          style={{
            backgroundColor: amountInWords ? '#f0f9ff' : '#f8f9fa',
            color: amountInWords ? '#1e40af' : '#6b7280',
            fontWeight: amountInWords ? 'bold' : 'normal',
            fontSize: amountInWords ? 17 : 16,
            minHeight: 48,
            resize: 'none',
            border: amountInWords 
              ? `2px solid ${currencyOptions.find(c => c.value === selectedCurrency)?.color || '#3b82f6'}` 
              : '2px solid #e5e7eb',
            boxShadow: amountInWords 
              ? `0 4px 12px ${currencyOptions.find(c => c.value === selectedCurrency)?.color || '#3b82f6'}25` 
              : '0 2px 4px rgba(0, 0, 0, 0.05)',
            transition: 'all 0.4s ease',
            borderRadius: 8,
            padding: '12px 16px',
            fontFamily: 'Tajawal, sans-serif',
            textAlign: 'center' as const,
            cursor: 'default'
          }} 
          size="large"
          autoSize={{ minRows: 1, maxRows: 4 }}
        />
      </Form.Item>
      <Form.Item
        label={<span style={labelStyle}>الفرع</span>}
        name="branch"
        rules={[{ required: true, message: 'يرجى اختيار الفرع' }]}
        style={{ flex: 1 }}
      >
        <Select
          showSearch
          placeholder="الفرع"
          style={largeControlStyle}
          size="large"
          dropdownStyle={{ fontSize: 18 }}
          className={styles.noAntBorder}
          optionFilterProp="label"
          filterOption={(input, option) =>
            (option?.label ?? '').toString().toLowerCase().includes(input.toLowerCase())
          }
        >
          {branchOptions.map(option => (
            <Option key={option.value} value={option.value} label={option.label}>
              {option.label}
            </Option>
          ))}
        </Select>
      </Form.Item>
    </div>
  </Col>
</Row>

          {/* الصف الثالث: استلمنا من */}
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                label={<span style={labelStyle}>استلمنا من</span>}
                name="receivedFrom"
                rules={[{ required: true, message: 'يرجى إدخال اسم من استلمنا منه' }]}
              >
                <Input
                  placeholder="استلمنا من"
                  style={largeControlStyle}
                  size="large"
                />
              </Form.Item>
            </Col>
          </Row>

          {/* الصف الرابع: الحساب الدائن، رقم الحساب، اسم الحساب، مركز التكلفة، رقم المركز */}
          <Row gutter={16}>
            <Col span={5}>
              <Form.Item
                label={<span style={labelStyle}>الحساب الدائن</span>}
                name="debitAccount"
                rules={[{ required: true, message: 'يرجى اختيار الحساب الدائن' }]}
              >
                <Select
                  placeholder="الحساب الدائن"
                  showSearch
                  style={largeControlStyle}
                  size="large"
                  dropdownStyle={{ fontSize: 18 }}
                  className={styles.noAntBorder}
                  onChange={handleDebitAccountChange}
                  value={selectedDebitAccount || form.getFieldValue('debitAccount')}
                >
                  {accountOptions.map(option => (
                    <Option key={option.value} value={option.value}>
                      {option.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item
                label={<span style={labelStyle}>رقم </span>}
                name="accountNumber"
              >
                <Input
                 placeholder="رقم الحساب" 
                 style={largeControlStyle} 
                 size="large"
                                   suffix={
                    <button
                      type="button"
                      style={{
                        borderRadius: 6,
                       
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: 32,
                        width: 32,
                        border: 'none',
                        background: 'transparent'
                      }}
                      title="شاشة الحسابات"
                      onClick={handleAccountNameButtonClick}
                    >
                      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M4 4v6h6V4H4zm10 0v6h6V4h-6zM4 14v6h6v-6H4zm10 0v6h6v-6h-6z" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                    </button>
                  }
                 />
              </Form.Item>
            </Col>
            <Col span={5}>
              <Form.Item
                label={<span style={labelStyle}>اسم الحساب</span>}
                name="accountName"
              >
                <Input
                  placeholder="اسم الحساب"
                  style={largeControlStyle}
                  size="large"
                  suffix={
                    <button
                      type="button"
                      style={{
                        borderRadius: 6,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: 32,
                        width: 32,
                        border: 'none',
                        background: 'transparent',
                        padding: 0
                      }}
                      title="بحث عميل/مورد"
                      onClick={handleAccountNameButtonClick}

                    >
                      <GiMagicBroom size={26} color="#8e44ad" />
                    </button>
                  }
                />
              </Form.Item>
            </Col>
      {/* مودال بحث عميل */}
      <Modal
        open={showCustomerModal}
        onCancel={() => setShowCustomerModal(false)}
        footer={null}
        title="بحث عن عميل"
        width={600}
      >
        <Input
          placeholder="بحث بالاسم أو رقم الحساب..."
          value={customerSearch}
          onChange={e => setCustomerSearch(e.target.value)}
          style={{ marginBottom: 12, fontSize: 17, borderRadius: 8, padding: '8px 12px' }}
          allowClear
        />
        <Table
          dataSource={customerAccounts.filter(acc => {
            const search = customerSearch.trim();
            return (
              acc.code.includes(search) ||
              acc.nameAr.includes(search) ||
              (acc.mobile && acc.mobile.includes(search)) ||
              (acc.taxNumber && acc.taxNumber.includes(search))
            );
          })}
          columns={[
            { title: 'رقم الحساب', dataIndex: 'code', key: 'code', width: 120 },
            { title: 'اسم الحساب', dataIndex: 'nameAr', key: 'nameAr' },
            { title: 'جوال العميل', dataIndex: 'mobile', key: 'mobile', width: 140, render: (text: string) => text || '-' },
            { title: 'الرقم الضريبي', dataIndex: 'taxNumber', key: 'taxNumber', width: 160, render: (text: string) => text || '-' }
          ]}
          rowKey="code"
          pagination={{ pageSize: 8 }}
          size="small"
          bordered
          onRow={record => ({
            onClick: () => {
              form.setFieldsValue({ accountNumber: record.code, accountName: record.nameAr });
              setShowCustomerModal(false);
            },
            style: { cursor: 'pointer' }
          })}
        />
      </Modal>
      {/* مودال بحث مورد */}
      <Modal
        open={showSupplierModal}
        onCancel={() => setShowSupplierModal(false)}
        footer={null}
        title="بحث عن مورد"
        width={600}
      >
        <Input
          placeholder="بحث بالاسم أو رقم الحساب..."
          value={supplierSearch}
          onChange={e => setSupplierSearch(e.target.value)}
          style={{ marginBottom: 12, fontSize: 17, borderRadius: 8, padding: '8px 12px' }}
          allowClear
        />
        <Table
          dataSource={supplierAccounts.filter(acc =>
            acc.code.includes(supplierSearch) || acc.nameAr.includes(supplierSearch) || (acc.mobile && acc.mobile.includes(supplierSearch))
          )}
          columns={[
            { title: 'رقم الحساب', dataIndex: 'code', key: 'code', width: 120 },
            { title: 'اسم الحساب', dataIndex: 'nameAr', key: 'nameAr' },
            { title: 'جوال المورد', dataIndex: 'mobile', key: 'mobile', width: 140, render: (text: string) => text || '-' }
          ]}
          rowKey="code"
          pagination={{ pageSize: 8 }}
          size="small"
          bordered
          onRow={record => ({
            onClick: () => {
              form.setFieldsValue({ accountNumber: record.code, accountName: record.nameAr });
              setShowSupplierModal(false);
            },
            style: { cursor: 'pointer' }
          })}
        />
      </Modal>
                        <Col span={5}>
              <Form.Item
                label={<span style={labelStyle}>رقم </span>}
                name="costCenterNumber"
              >
                <Input placeholder="رقم المركز"
                 style={largeControlStyle} 
                 size="large"
                                                    suffix={
                    <button
                      type="button"
                      style={{
                        borderRadius: 6,
                       
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: 32,
                        width: 32,
                        border: 'none',
                        background: 'transparent'
                      }}
                      title="شاشة الحسابات"
                    >
                      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M4 4v6h6V4H4zm10 0v6h6V4h-6zM4 14v6h6v-6H4zm10 0v6h6v-6h-6z" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                    </button>
                  }
                 />
              </Form.Item>
            </Col>
            <Col span={5}>
              <Form.Item
                label={<span style={labelStyle}>مركز التكلفة</span>}
                name="costCenter"
              >
                <Input placeholder="مركز التكلفة" 
                style={largeControlStyle} 
                size="large"
                                  suffix={
                    <button
                      type="button"
                      style={{
                        borderRadius: 6,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: 32,
                        width: 32,
                        border: 'none',
                        background: 'transparent',
                        padding: 0
                      }}
                      title="بحث ذكي (عصا سحرية)"
                    >
                      <GiMagicBroom size={26} color="#8e44ad" />
                    </button>
                  }
                />
              </Form.Item>
            </Col>

          </Row>

          {/* الصف الخامس: رقم المحصل، المحصل، طريقة الدفع */}
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label={<span style={labelStyle}>رقم المحصل</span>}
                name="collectorNumber"
              >
                <Input placeholder="رقم المحصل"
                 style={largeControlStyle}
                 size="large"
                 suffix={
                    <button
                      type="button"
                      style={{
                        borderRadius: 6,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: 32,
                        width: 32,
                        border: 'none',
                        background: 'transparent'
                      }}
                      title="بحث عن محصل"
                      onClick={handleCollectorNumberButtonClick}
                    >
                      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M4 4v6h6V4H4zm10 0v6h6V4h-6zM4 14v6h6v-6H4zm10 0v6h6v-6h-6z" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                    </button>
                  }
                />
              </Form.Item>
            </Col>
      {/* مودال بحث محصل */}
      <Modal
        open={showCollectorModal}
        onCancel={() => setShowCollectorModal(false)}
        footer={null}
        title="بحث عن محصل"
        width={600}
      >
        <Input
          placeholder="بحث بالاسم أو رقم المحصل..."
          value={collectorSearch}
          onChange={e => setCollectorSearch(e.target.value)}
          style={{ marginBottom: 12, fontSize: 17, borderRadius: 8, padding: '8px 12px' }}
          allowClear
        />
        <Table
          dataSource={collectorAccounts.filter(acc =>
            acc.number.includes(collectorSearch) || acc.name.includes(collectorSearch) || (acc.mobile && acc.mobile.includes(collectorSearch))
          )}
          columns={[
            { title: 'رقم المحصل', dataIndex: 'number', key: 'number', width: 140 },
            { title: 'اسم المحصل', dataIndex: 'name', key: 'name' },
            { title: 'معرف داخلي', dataIndex: 'id', key: 'id', width: 180, render: () => null, hidden: true },
            { title: 'جوال المحصل', dataIndex: 'mobile', key: 'mobile', width: 140, render: (text: string) => text || '-' }
          ].filter(col => !col.hidden)}
          rowKey="id"
          pagination={{ pageSize: 8 }}
          size="small"
          bordered
          onRow={record => ({
            onClick: () => {
              form.setFieldsValue({ collectorNumber: record.number, collector: record.name });
              setShowCollectorModal(false);
            },
            style: { cursor: 'pointer' }
          })}
        />
      </Modal>
            <Col span={8}>
              <Form.Item
                label={<span style={labelStyle}>المحصل</span>}
                name="collector"
              >
                <Input placeholder="المحصل" 
                style={largeControlStyle} 
                size="large" 
        
                                  suffix={
                    <button
                      type="button"
                      style={{
                        borderRadius: 6,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: 32,
                        width: 32,
                        border: 'none',
                        background: 'transparent',
                        padding: 0
                      }}
                      title="بحث ذكي (عصا سحرية)"
                      onClick={handleCollectorNumberButtonClick}

                    >
                      <GiMagicBroom size={26} color="#8e44ad" />
                    </button>
                  }
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label={<span style={labelStyle}>طريقة الدفع</span>}
                name="paymentMethod"
                rules={[{ required: true, message: 'يرجى اختيار طريقة الدفع' }]}
              >
                <Select
                  placeholder="طريقة الدفع"
                  style={largeControlStyle}
                  size="large"
                  dropdownStyle={{ fontSize: 18 }}
                  className={styles.noAntBorder}
                  value={selectedPaymentMethod || form.getFieldValue('paymentMethod')}
                  onChange={value => {
                    setSelectedPaymentMethod(value);
                    form.setFieldValue('paymentMethod', value);
                  }}
                >
                  {paymentMethodOptions.map(option => (
                    <Option key={option.value} value={option.value}>
                      {option.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          {/* الصف السادس: الرقم الدفتري، جلب آخر رقم، الصندوق/بنك */}
          <Row gutter={16}>

            <Col span={8}>
              <Form.Item
                label={<span style={labelStyle}>الصندوق/بنك</span>}
                name="cashboxBank"
              >
                <Select
                  showSearch
                  placeholder="اختر الصندوق أو البنك"
                  style={largeControlStyle}
                  size="large"
                  dropdownStyle={{ fontSize: 18 }}
                  className={styles.noAntBorder}
                  optionFilterProp="label"
                  filterOption={(input, option) =>
                    (option?.label ?? '').toString().toLowerCase().includes(input.toLowerCase())
                  }
                >
                  {cashboxBankOptions.map(option => (
                    <Option key={option.value} value={option.value} label={option.label}>
                      {option.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col span={16}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
                <Form.Item
                  label={<span style={labelStyle}>عنوان المستند</span>}
                  name="documentTitle"
                  style={{ flex: 2, marginBottom: 0 }}
                >
                  <Input placeholder="عنوان المستند" style={largeControlStyle} size="large" />
                </Form.Item>
                <Form.Item
                  label={<span style={labelStyle}>رفع المستند</span>}
                  name="documentFile"
                  valuePropName="fileList"
                  getValueFromEvent={e => (Array.isArray(e) ? e : e && e.fileList)}
                  style={{ flex: 1, marginBottom: 0 }}
                >
                  <Input
                    type="file"
                    style={{ width: '100%', height: 48, fontSize: 16, borderRadius: 8, border: '1.5px solid #d9d9d9', padding: '8px 12px', background: '#fff' }}
                  />
                </Form.Item>
              </div>
            </Col>

          </Row>

          {/* الصف السابع: رقم الشيك/تحويل، تاريخ الشيك/تحويل، اختيار البنك */}
          {/* إظهار حقول الشيك/تحويل فقط إذا كانت طريقة الدفع تحويل بنكي */}
          {selectedPaymentMethod === 'transfer' && (
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  label={<span style={labelStyle}>رقم الشيك/تحويل</span>}
                  name="checkTransferNumber"
                >
                  <Input placeholder="رقم الشيك/تحويل" style={largeControlStyle} size="large" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={<span style={labelStyle}>تاريخ الشيك/تحويل</span>}
                  name="checkTransferDate"
                >
                  <DatePicker style={{ width: '100%', ...largeControlStyle }} placeholder="تاريخ الشيك/تحويل" size="large" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={<span style={labelStyle}>اختيار البنك</span>}
                  name="bankSelection"
                >
                  <Select placeholder="اختيار البنك" showSearch style={largeControlStyle} size="large" dropdownStyle={{ fontSize: 18 }} className={styles.noAntBorder} optionFilterProp="label" filterOption={(input, option) => (option?.label ?? '').toString().toLowerCase().includes(input.toLowerCase())}>
                    {bankOptions.map(option => (
                      <Option key={option.value} value={option.value} label={option.label}>
                        {option.label}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          )}

          {/* البيان */}
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                label={<span style={labelStyle}>البيان</span>}
                name="description"
              >
                <Input.TextArea rows={3} placeholder="البيان" style={{ fontSize: 18, borderRadius: 8, padding: '12px 16px' }} />
              </Form.Item>
            </Col>
          </Row>

          {/* أزرار الإضافة والتفريغ */}
          <Row gutter={16} style={{ marginBottom: '24px' }}>
            <Col span={12}>
              <Button type="primary" htmlType="submit" style={{ width: '100%', height: 48, fontSize: 18, borderRadius: 8 }} size="large">
                إضافة
              </Button>
            </Col>
            <Col span={12}>
              <Button 
                type="default" 
                htmlType="button"
                onClick={handleFormReset}
                style={{ width: '100%', height: 48, fontSize: 18, borderRadius: 8 }}
                size="large"
              >
                تفريغ
              </Button>
            </Col>
          </Row>
        </Form>

        <Divider />

      
      </Card>
    </div>
    </>
  );
}

export default ReceiptVoucher;
