
import React, { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import { useNavigate } from 'react-router-dom';
import { SearchOutlined as SearchIcon } from '@ant-design/icons';
import { Card, Row, Col, Input, Button, DatePicker, Select, Table, Space, message, Modal } from 'antd';
import { PrinterOutlined } from '@ant-design/icons';
import './ReceiptVouchersDirectory.css';
import { SearchOutlined, ReloadOutlined, FileTextOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
dayjs.extend(isBetween);
import Breadcrumb from '../../components/Breadcrumb';

// استيراد firebase
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { getAccounts } from '@/lib/accountsService';
import { GiMagicBroom } from 'react-icons/gi';
import { fetchCashBoxes } from '@/services/cashBoxesService';
import { fetchBankAccounts } from '@/services/bankAccountsService';
import { fetchBranches } from '@/lib/branches';
import styles from './ReceiptVoucher.module.css';

const { RangePicker } = DatePicker;
const { Option } = Select;

// نموذج بيانات السند (يمكن تعديله حسب قاعدة البيانات الفعلية)
interface ReceiptVoucher {
  id: string;
  dateRange: [string, string] | null;
  entryNumber: string;
  voucherNumber: string;
  date: string;
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
  checkTransferDate: string | null;
  bankSelection: string;
  description: string;
  createdAt: string;
}

const ReceiptVouchersDirectory: React.FC = () => {
  // دالة طباعة الجدول
  const handlePrint = () => {
    window.print();
  };
  // دالة تصدير البيانات إلى Excel
  const handleExport = () => {
    // تصدير بنفس تنسيق صفحة مبيعات الفروع باستخدام exceljs من CDN
    (async () => {
      // تحميل exceljs من CDN إذا لم يكن موجوداً في window
      let ExcelJS = (window as any).ExcelJS;
      if (!ExcelJS) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://cdnjs.cloudflare.com/ajax/libs/exceljs/4.3.0/exceljs.min.js';
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
        ExcelJS = (window as any).ExcelJS;
      }

      const exportData = data.map(row => [
        row.entryNumber,
        row.voucherNumber,
        row.date,
        branchOptions.find(opt => opt.value === row.branch)?.label || row.branch,
        row.amount,
        row.debitAccount,
        row.accountName,
        paymentMethodOptions.find(opt => opt.value === row.paymentMethod)?.label || row.paymentMethod,
        cashboxBankOptions.find(opt => opt.value === row.cashboxBank)?.label || row.cashboxBank,
        row.description,
        row.createdAt
      ]);

      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet('سندات القبض');

      // إعداد الأعمدة
      sheet.columns = [
        { header: 'رقم القيد', key: 'entryNumber', width: 15 },
        { header: 'رقم السند', key: 'voucherNumber', width: 15 },
        { header: 'التاريخ', key: 'date', width: 15 },
        { header: 'الفرع', key: 'branch', width: 18 },
        { header: 'المبلغ', key: 'amount', width: 15 },
        { header: 'اسم الحساب', key: 'accountName', width: 18 },
        { header: 'طريقة الدفع', key: 'paymentMethod', width: 15 },
        { header: 'الصندوق/بنك', key: 'cashboxBank', width: 18 },
        { header: 'تاريخ الإنشاء', key: 'createdAt', width: 18 }
      ];

      // إضافة البيانات
      sheet.addRows(exportData);

      // تنسيق رأس الجدول
      sheet.getRow(1).eachCell(cell => {
        cell.font = { bold: true, color: { argb: 'FF305496' } };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFDDEBF7' }
        };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFAAAAAA' } },
          bottom: { style: 'thin', color: { argb: 'FFAAAAAA' } },
          left: { style: 'thin', color: { argb: 'FFAAAAAA' } },
          right: { style: 'thin', color: { argb: 'FFAAAAAA' } },
        };
      });

      // تنسيق بقية الصفوف
      for (let i = 2; i <= sheet.rowCount; i++) {
        const row = sheet.getRow(i);
        row.eachCell(cell => {
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
          cell.border = {
            top: { style: 'thin', color: { argb: 'FFDDDDDD' } },
            bottom: { style: 'thin', color: { argb: 'FFDDDDDD' } },
            left: { style: 'thin', color: { argb: 'FFDDDDDD' } },
            right: { style: 'thin', color: { argb: 'FFDDDDDD' } },
          };
        });
      }

      // Freeze header row
      sheet.views = [{ state: 'frozen', ySplit: 1 }];
      sheet.autoFilter = {
        from: { row: 1, column: 1 },
        to: { row: 1, column: sheet.columnCount }
      };

      // إنشاء ملف وحفظه
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `سندات_القبض_${dayjs().format('YYYYMMDD_HHmmss')}.xlsx`;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }, 100);
    })();
  };
  // قائمة البنوك من قاعدة البيانات الحقيقية (لعمود البنك)
  const [bankOptions, setBankOptions] = useState<{ value: string; label: string }[]>([]);
  useEffect(() => {
    const fetchBanks = async () => {
      try {
        const bankAccounts = await fetchBankAccounts();
        const banks = bankAccounts.map(bank => ({
          value: bank.id || '',
          label: bank.arabicName || bank.englishName || ''
        }));
        setBankOptions(banks);
      } catch (err) {
        setBankOptions([]);
      }
    };
    fetchBanks();
  }, []);
  // قائمة أسماء الصناديق والبنوك من قاعدة البيانات الحقيقية
  const [cashboxBankOptions, setCashboxBankOptions] = useState<{ value: string; label: string }[]>([]);
  useEffect(() => {
    const fetchCashboxesAndBanks = async () => {
      try {
        // جلب الصناديق والبنوك من الخدمات الحقيقية
        const [cashBoxes, bankAccounts] = await Promise.all([
          fetchCashBoxes(),
          fetchBankAccounts()
        ]);
        
        const cashboxOptions = cashBoxes.map(cb => ({
          value: `cashbox-${cb.id}`,
          label: `صندوق: ${cb.nameAr}`
        }));
        
        const bankOptions = bankAccounts.map(bk => ({
          value: `bank-${bk.id}`,
          label: `بنك: ${bk.arabicName}`
        }));
        
        setCashboxBankOptions([...cashboxOptions, ...bankOptions]);
      } catch (err) {
        setCashboxBankOptions([]);
      }
    };
    fetchCashboxesAndBanks();
  }, []);
  // بيانات البحث
  const [searchEntryNumber, setSearchEntryNumber] = useState('');
  const [searchVoucherNumber, setSearchVoucherNumber] = useState('');
  const [searchDateRange, setSearchDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
  const [searchBranch, setSearchBranch] = useState('');
  const [searchDebitAccount, setSearchDebitAccount] = useState('');
  const [searchAccountNumber, setSearchAccountNumber] = useState('');
  const [searchAccountName, setSearchAccountName] = useState('');
  const [searchCollector, setSearchCollector] = useState('');
  // Modal states for account/collector search
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [showCollectorModal, setShowCollectorModal] = useState(false);
  const [customerSearch, setCustomerSearch] = useState('');
  const [supplierSearch, setSupplierSearch] = useState('');
  const [collectorSearch, setCollectorSearch] = useState('');
  
  // بيانات حقيقية للحسابات والمحصلين
  const [customerAccounts, setCustomerAccounts] = useState<{ code: string; nameAr: string; mobile?: string; taxNumber?: string }[]>([]);
  const [supplierAccounts, setSupplierAccounts] = useState<{ code: string; nameAr: string; mobile?: string }[]>([]);
  const [collectorAccounts, setCollectorAccounts] = useState<{ number: string; name: string; mobile?: string; id: string }[]>([]);

  // جلب بيانات العملاء الحقيقية
  useEffect(() => {
    if (showCustomerModal) {
      getAccounts()
        .then((accounts) => {
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

  // جلب بيانات الموردين الحقيقية
  useEffect(() => {
    if (showSupplierModal) {
      getAccounts()
        .then((accounts) => {
          const suppliers = accounts.filter(acc => acc.linkedToPage === 'suppliers');
          setSupplierAccounts(suppliers.map(acc => ({
            code: acc.code,
            nameAr: acc.nameAr,
            mobile: acc.supplierData?.phone || ''
          })));
        })
        .catch(() => setSupplierAccounts([]));
    }
  }, [showSupplierModal]);

  // جلب بيانات المحصلين الحقيقية
  useEffect(() => {
    if (showCollectorModal) {
      const fetchCollectors = async () => {
        try {
          const repsSnapshot = await getDocs(collection(db, 'salesRepresentatives'));
          const reps = repsSnapshot.docs.map((doc, idx) => {
            const data = doc.data();
            return {
              id: doc.id,
              number: (idx + 1).toString(),
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
    }
  }, [showCollectorModal]);
  const [searchPaymentMethod, setSearchPaymentMethod] = useState('');
  const [searchCashboxBank, setSearchCashboxBank] = useState('');
  const [searchCreatedAtRange, setSearchCreatedAtRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
  const [searchReceivedFrom, setSearchReceivedFrom] = useState('');

  // بيانات النتائج
  const [data, setData] = useState<ReceiptVoucher[]>([]);
  const [loading, setLoading] = useState(false);

  // بيانات الفروع وطرق الدفع
  const [branchOptions, setBranchOptions] = useState<{ value: string; label: string }[]>([
    { value: '', label: 'كل الفروع' }
  ]);
  // جلب الفروع من قاعدة البيانات الحقيقية
  useEffect(() => {
    const loadBranches = async () => {
      try {
        const branches = await fetchBranches();
        const branchOptions = branches.map(branch => ({
          value: branch.id || branch.code,
          label: branch.name
        }));
        setBranchOptions([{ value: '', label: 'كل الفروع' }, ...branchOptions]);
      } catch (err) {
        setBranchOptions([{ value: '', label: 'كل الفروع' }]);
      }
    };
    loadBranches();
  }, []);
  const paymentMethodOptions = [
    { value: '', label: 'كل الطرق' },
    { value: 'cash', label: 'نقدي' },
    { value: 'network', label: 'شبكة' },
    { value: 'transfer', label: 'تحويل بنكي' },
  ];

  const currencyOptions = [
    { value: 'EGP', label: 'جنيه مصري' },
    { value: 'USD', label: 'دولار أمريكي' },
    { value: 'EUR', label: 'يورو' },
    { value: 'SAR', label: 'ريال سعودي' },
  ];


  // جلب البيانات الحقيقية من Firestore
  const fetchData = async () => {
    setLoading(true);
    try {
      const q = collection(db, 'receiptVouchers');
      const snapshot = await getDocs(q);
      let vouchers: ReceiptVoucher[] = snapshot.docs.map(doc => {
        const d = doc.data();
        return {
          id: doc.id,
          dateRange: d.dateRange || null,
          entryNumber: d.entryNumber || '',
          voucherNumber: d.voucherNumber || '',
          date: d.date || '',
          currency: d.currency || '',
          exchangeRate: d.exchangeRate || '',
          amount: d.amount || '',
          amountInWords: d.amountInWords || '',
          branch: d.branch || '',
          receivedFrom: d.receivedFrom || '',
          debitAccount: d.debitAccount || '',
          accountNumber: d.accountNumber || '',
          accountName: d.accountName || '',
          costCenter: d.costCenter || '',
          costCenterNumber: d.costCenterNumber || '',
          collectorNumber: d.collectorNumber || '',
          collector: d.collector || '',
          paymentMethod: d.paymentMethod || '',
          bookNumber: d.bookNumber || '',
          cashboxBank: d.cashboxBank || '',
          checkTransferNumber: d.checkTransferNumber || '',
          checkTransferDate: d.checkTransferDate || '',
          bankSelection: d.bankSelection || '',
          description: d.description || '',
          createdAt: d.createdAt || '',
        };
      });
      // تصفية النتائج بناءً على خيارات البحث
      vouchers = vouchers.filter(v => {
        const entryNumberMatch = searchEntryNumber ? v.entryNumber.includes(searchEntryNumber) : true;
        const voucherNumberMatch = searchVoucherNumber ? v.voucherNumber.includes(searchVoucherNumber) : true;
        const dateMatch = searchDateRange && searchDateRange.length === 2
          ? (v.date && dayjs(v.date).isBetween(searchDateRange[0], searchDateRange[1], null, '[]'))
          : true;
        const branchMatch = searchBranch ? v.branch === searchBranch : true;
        const debitAccountMatch = searchDebitAccount ? v.debitAccount.includes(searchDebitAccount) : true;
        const accountNumberMatch = searchAccountNumber ? v.accountNumber.includes(searchAccountNumber) : true;
        const accountNameMatch = searchAccountName ? v.accountName.includes(searchAccountName) : true;
        const collectorMatch = searchCollector ? v.collector.includes(searchCollector) : true;
        const paymentMethodMatch = searchPaymentMethod ? v.paymentMethod === searchPaymentMethod : true;
        const cashboxBankMatch = searchCashboxBank ? v.cashboxBank.includes(searchCashboxBank) : true;
        const createdAtMatch = searchCreatedAtRange && searchCreatedAtRange.length === 2
          ? (v.createdAt && dayjs(v.createdAt).isBetween(searchCreatedAtRange[0], searchCreatedAtRange[1], null, '[]'))
          : true;
        const receivedFromMatch = searchReceivedFrom ? v.receivedFrom.includes(searchReceivedFrom) : true;
        return (
          entryNumberMatch &&
          voucherNumberMatch &&
          dateMatch &&
          branchMatch &&
          debitAccountMatch &&
          accountNumberMatch &&
          accountNameMatch &&
          collectorMatch &&
          paymentMethodMatch &&
          cashboxBankMatch &&
          createdAtMatch &&
          receivedFromMatch
        );
      });
      setData(vouchers);
    } catch (err) {
      message.error('تعذر جلب بيانات السندات');
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // دالة البحث (يمكن ربطها مع API)
  const handleSearch = () => {
    fetchData();
  };

  // دالة إعادة تعيين البحث
  const handleReset = () => {
    setSearchEntryNumber('');
    setSearchVoucherNumber('');
    setSearchDateRange(null);
    setSearchBranch('');
    setSearchDebitAccount('');
    setSearchAccountNumber('');
    setSearchAccountName('');
    setSearchCollector('');
    setSearchPaymentMethod('');
    setSearchCashboxBank('');
    setSearchCreatedAtRange(null);
    setSearchReceivedFrom('');
    fetchData();
  };

  // أعمدة الجدول
  const columns = [
    { title: 'رقم القيد', dataIndex: 'entryNumber', key: 'entryNumber', width: 180 },
    { title: 'رقم السند', dataIndex: 'voucherNumber', key: 'voucherNumber', width: 200 },
    // تم حذف عمود الفترة المحاسبية
    { title: 'التاريخ', dataIndex: 'date', key: 'date', width: 180, render: (v: string) => v ? dayjs(v).format('YYYY-MM-DD') : '' },
    {
      title: 'العملة',
      dataIndex: 'currency',
      key: 'currency',
      width: 150,
      render: (value: string) => {
        const currency = currencyOptions.find(opt => opt.value === value);
        return currency ? currency.label : value;
      }
    },
    { title: 'التعادل', dataIndex: 'exchangeRate', key: 'exchangeRate', width: 150 },
    { title: 'المبلغ', dataIndex: 'amount', key: 'amount', width: 180, render: (v: number) => v?.toLocaleString() },
    { title: 'المبلغ مكتوب', dataIndex: 'amountInWords', key: 'amountInWords', width: 420 },
    {
      title: 'الفرع',
      dataIndex: 'branch',
      key: 'branch',
      width: 180,
      render: (branchId: string) => {
        const branch = branchOptions.find(opt => opt.value === branchId);
        return branch ? branch.label : branchId;
      }
    },
    { title: 'استلمنا من', dataIndex: 'receivedFrom', key: 'receivedFrom', width: 200 },
    {
      title: 'الحساب الدائن',
      dataIndex: 'debitAccount',
      key: 'debitAccount',
      width: 200,
      render: (value: string) => {
        if (value === 'acc3') return 'حساب العملاء';
        if (value === 'acc4') return 'حساب الموردين';
        return value;
      }
    },
    { title: 'رقم الحساب', dataIndex: 'accountNumber', key: 'accountNumber', width: 200 },
    { title: 'اسم الحساب', dataIndex: 'accountName', key: 'accountName', width: 220 },
    { title: 'مركز التكلفة', dataIndex: 'costCenter', key: 'costCenter', width: 200 },
    { title: 'رقم مركز التكلفة', dataIndex: 'costCenterNumber', key: 'costCenterNumber', width: 200 },
    { title: 'رقم المحصل', dataIndex: 'collectorNumber', key: 'collectorNumber', width: 180 },
    { title: 'المحصل', dataIndex: 'collector', key: 'collector', width: 180 },
    {
      title: 'طريقة الدفع',
      dataIndex: 'paymentMethod',
      key: 'paymentMethod',
      width: 180,
      render: (value: string) => {
        const method = paymentMethodOptions.find(opt => opt.value === value);
        return method ? method.label : value;
      }
    },
    { title: 'الرقم الدفتري', dataIndex: 'bookNumber', key: 'bookNumber', width: 180 },
    {
      title: 'الصندوق/بنك',
      dataIndex: 'cashboxBank',
      key: 'cashboxBank',
      width: 200,
      render: (value: string) => {
        // البحث في قائمة الصناديق والبنوك أولاً
        const cashbox = cashboxBankOptions.find(opt => opt.value === value);
        if (cashbox) return cashbox.label;
        // البحث في الفروع إذا لم يوجد في القائمة
        const branch = branchOptions.find(opt => opt.value === value);
        if (branch) return branch.label;
        return value;
      }
    },
    { title: 'رقم الشيك/تحويل', dataIndex: 'checkTransferNumber', key: 'checkTransferNumber', width: 200 },
    {
      title: 'تاريخ الشيك/تحويل',
      dataIndex: 'checkTransferDate',
      key: 'checkTransferDate',
      width: 200,
      render: (v: string) => v ? dayjs(v).format('YYYY-MM-DD') : ''
    },
    {
      title: 'البنك',
      dataIndex: 'bankSelection',
      key: 'bankSelection',
      width: 180,
      render: (value: string) => {
        const bank = bankOptions.find(opt => opt.value === value);
        return bank ? bank.label : value;
      }
    },
    { title: 'البيان', dataIndex: 'description', key: 'description', width: 260 },
    { title: 'تاريخ الإنشاء', dataIndex: 'createdAt', key: 'createdAt', width: 220, render: (v: string) => dayjs(v).format('YYYY-MM-DD HH:mm') },
  ];

  // نفس ستايل صفحة سند القبض
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

  const labelStyle = { fontSize: 18, fontWeight: 500, marginBottom: 2, display: 'block' };

  const navigate = useNavigate();
  return (
    <div style={{ padding: 24 }}>
      <div className="p-4 font-['Tajawal'] bg-white mb-4 rounded-lg shadow-[0_0_10px_rgba(0,0,0,0.1)] relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <FileTextOutlined className="text-2xl text-blue-600 ml-3" />
            <h1 className="text-2xl font-bold text-gray-800">دليل سندات القبض</h1>
          </div>
          <Button
            type="primary"
            style={{ height: 44, fontSize: 17, borderRadius: 8, background: 'linear-gradient(90deg,#22c55e,#2563eb)', border: 'none', fontWeight: 500 }}
            icon={<FileTextOutlined />}
            onClick={() => navigate('/stores/receipt-voucher')}
          >
            إضافة سند قبض
          </Button>
        </div>
        <p className="text-gray-600 mt-2">متابعة وإدارة سندات القبض</p>
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-blue-500"></div>
      </div>
            <Breadcrumb
              items={[
                { label: "الرئيسية", to: "/" },
                { label: "ادراة المبيعات", to: "/management/sales" },
                { label: "دليل سندات القبض"},

              ]}
            />
      <Card style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <Row gutter={12} align="middle">
            <Col span={5}>
              <span style={labelStyle}>رقم القيد</span>
              <Input placeholder="رقم القيد" value={searchEntryNumber} onChange={e => setSearchEntryNumber(e.target.value)} allowClear style={largeControlStyle} size="large" />
            </Col>
            <Col span={5}>
              <span style={labelStyle}>رقم السند</span>
              <Input placeholder="رقم السند" value={searchVoucherNumber} onChange={e => setSearchVoucherNumber(e.target.value)} allowClear style={largeControlStyle} size="large" />
            </Col>
            <Col span={5}>
              <span style={labelStyle}>تاريخ السند</span>
              <RangePicker value={searchDateRange} onChange={setSearchDateRange} style={{ width: '100%', ...largeControlStyle }} placeholder={["من تاريخ السند", "إلى تاريخ السند"]} size="large" />
            </Col>
            <Col span={5}>
              <span style={labelStyle}>الفرع</span>
              <Select
                showSearch
                placeholder="الفرع"
                value={searchBranch}
                onChange={v => setSearchBranch(v)}
                style={{ width: '100%', ...largeControlStyle }}
                size="large"
                dropdownStyle={{ fontSize: 18 }}
                className={styles.noAntBorder}
                optionFilterProp="label"
                filterOption={(input, option) =>
                  (option?.label ?? '').toString().toLowerCase().includes(input.toLowerCase())
                }
              >
                {branchOptions.map(opt => (
                  <Option key={opt.value} value={opt.value} label={opt.label}>{opt.label}</Option>
                ))}
              </Select>
            </Col>
            <Col span={4}>
              <span style={labelStyle}>الحساب الدائن</span>
              <Select
                showSearch
                placeholder="الحساب الدائن"
                value={searchDebitAccount}
                onChange={(v) => {
                  setSearchDebitAccount(v);
                  setSearchAccountNumber('');
                  setSearchAccountName('');
                }}
                allowClear
                style={{ width: '100%', ...largeControlStyle }}
                size="large"
                dropdownStyle={{ fontSize: 18 }}
                className={styles.noAntBorder}
                optionFilterProp="label"
                filterOption={(input, option) =>
                  (option?.children ?? '').toString().toLowerCase().includes(input.toLowerCase())
                }
              >
                <Option value="" label="كل الحسابات">كل الحسابات</Option>
                <Option value="acc3" label="حساب العملاء">حساب العملاء</Option>
                <Option value="acc4" label="حساب الموردين">حساب الموردين</Option>
              </Select>
            </Col>
          </Row>
          <Row gutter={12} align="middle">
            <Col span={5}>
              <span style={labelStyle}>رقم الحساب</span>
              <Input
                placeholder="رقم الحساب"
                value={searchAccountNumber}
                onChange={e => setSearchAccountNumber(e.target.value)}
                allowClear
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
                      title={searchDebitAccount === 'acc3' ? "بحث عميل" : searchDebitAccount === 'acc4' ? "بحث مورد" : "اختر الحساب الدائن أولاً"}
                     onClick={() => {
                       if (searchDebitAccount === 'acc3') {
                         setShowCustomerModal(true);
                       } else if (searchDebitAccount === 'acc4') {
                         setShowSupplierModal(true);
                       }
                     }}
                     disabled={!searchDebitAccount}
                    >
                      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M4 4v6h6V4H4zm10 0v6h6V4h-6zM4 14v6h6v-6H4zm10 0v6h6v-6h-6z" stroke={searchDebitAccount ? "currentColor" : "#d1d5db"} strokeWidth="2"/>
                      </svg>
                    </button>
                }
              />
            </Col>
            <Col span={5}>
              <span style={labelStyle}>اسم الحساب</span>
              <Input
                placeholder="اسم الحساب"
                value={searchAccountName}
                onChange={e => setSearchAccountName(e.target.value)}
                allowClear
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
                                      title={searchDebitAccount === 'acc3' ? "بحث عميل" : searchDebitAccount === 'acc4' ? "بحث مورد" : "اختر الحساب الدائن أولاً"}
                                      onClick={() => {
                                        if (searchDebitAccount === 'acc3') {
                                          setShowCustomerModal(true);
                                        } else if (searchDebitAccount === 'acc4') {
                                          setShowSupplierModal(true);
                                        }
                                      }}
                                      disabled={!searchDebitAccount}              
                                    >
                                      <GiMagicBroom size={26} color={searchDebitAccount ? "#8e44ad" : "#d1d5db"} />
                                    </button>
                }
              />
            </Col>
            <Col span={5}>
              <span style={labelStyle}>المحصل</span>
              <Input
                placeholder="المحصل"
                value={searchCollector}
                onChange={e => setSearchCollector(e.target.value)}
                allowClear
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
onClick={() => setShowCollectorModal(true)}                                    >
                                      <GiMagicBroom size={26} color="#8e44ad" />
                                    </button>
                }
              />
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
            { title: 'جوال العميل', dataIndex: 'mobile', key: 'mobile', width: 140, render: (text) => text || '-' },
            { title: 'الرقم الضريبي', dataIndex: 'taxNumber', key: 'taxNumber', width: 160, render: (text) => text || '-' }
          ]}
          rowKey="code"
          pagination={{ pageSize: 8 }}
          size="small"
          bordered
          onRow={record => ({
            onClick: () => {
              setSearchAccountNumber(record.code);
              setSearchAccountName(record.nameAr);
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
            { title: 'جوال المورد', dataIndex: 'mobile', key: 'mobile', width: 140, render: (text) => text || '-' }
          ]}
          rowKey="code"
          pagination={{ pageSize: 8 }}
          size="small"
          bordered
          onRow={record => ({
            onClick: () => {
              setSearchAccountNumber(record.code);
              setSearchAccountName(record.nameAr);
              setShowSupplierModal(false);
            },
            style: { cursor: 'pointer' }
          })}
        />
      </Modal>
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
            { title: 'جوال المحصل', dataIndex: 'mobile', key: 'mobile', width: 140, render: (text) => text || '-' }
          ]}
          rowKey="id"
          pagination={{ pageSize: 8 }}
          size="small"
          bordered
          onRow={record => ({
            onClick: () => {
              setSearchCollector(record.name);
              setShowCollectorModal(false);
            },
            style: { cursor: 'pointer' }
          })}
        />
      </Modal>
            <Col span={5}>
              <span style={labelStyle}>طريقة الدفع</span>
              <Select
                showSearch
                placeholder="طريقة الدفع"
                value={searchPaymentMethod}
                onChange={v => setSearchPaymentMethod(v)}
                style={{ width: '100%', ...largeControlStyle }}
                size="large"
                dropdownStyle={{ fontSize: 18 }}
                className={styles.noAntBorder}
                optionFilterProp="label"
                filterOption={(input, option) =>
                  (option?.label ?? '').toString().toLowerCase().includes(input.toLowerCase())
                }
              >
                {paymentMethodOptions.map(opt => (
                  <Option key={opt.value} value={opt.value} label={opt.label}>{opt.label}</Option>
                ))}
              </Select>
            </Col>
            <Col span={4}>
              <span style={labelStyle}>الصندوق/بنك</span>
              <Input placeholder="الصندوق/بنك" value={searchCashboxBank} onChange={e => setSearchCashboxBank(e.target.value)} allowClear style={largeControlStyle} size="large" />
            </Col>
          </Row>
          <Row gutter={12} align="middle">
            <Col span={5}>
              <span style={labelStyle}>تاريخ الإنشاء</span>
              <RangePicker value={searchCreatedAtRange} onChange={setSearchCreatedAtRange} style={{ width: '100%', ...largeControlStyle }} placeholder={["من تاريخ الإنشاء", "إلى تاريخ الإنشاء"]} showTime size="large" />
            </Col>
            <Col span={5}>
              <span style={labelStyle}>استلمنا من</span>
              <Input placeholder="استلمنا من" value={searchReceivedFrom} onChange={e => setSearchReceivedFrom(e.target.value)} allowClear style={largeControlStyle} size="large" />
            </Col>
            <Col span={14} style={{ display: 'flex', alignItems: 'end', justifyContent: 'end' }}>
              <Space>
                <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch} style={{ height: 48, fontSize: 18, borderRadius: 8 }} size="large" />
                <Button icon={<ReloadOutlined />} onClick={handleReset} style={{ height: 48, fontSize: 18, borderRadius: 8 }} size="large" />
                <Button
                  type="default"
                  style={{
                    height: 48,
                    fontSize: 18,
                    borderRadius: 8,
                    fontWeight: 500,
                    boxShadow: '0 1px 6px rgba(0,0,0,0.07)',
                    background: 'linear-gradient(90deg,#22c55e,#16a34a)',
                    color: '#fff',
                    border: 'none'
                  }}
                  icon={<FileTextOutlined />}
                  onClick={handleExport}
                >
                  تصدير Excel
                </Button>
                <Button
                  type="default"
                  style={{
                    height: 48,
                    fontSize: 18,
                    borderRadius: 8,
                    fontWeight: 500,
                    boxShadow: '0 1px 6px rgba(0,0,0,0.07)',
                    background: 'linear-gradient(90deg,#60a5fa,#3b82f6)',
                    color: '#fff',
                    border: 'none'
                  }}
                  icon={<PrinterOutlined />}
                  onClick={handlePrint}
                >
                  طباعة
                </Button>
              </Space>
            </Col>
          </Row>
        </div>
      </Card>
      <Card>
        <Table
          columns={columns}
          dataSource={data}
          loading={loading}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          scroll={{ x: 4000 }}
          className="blue-table-header"
        />
      </Card>
    </div>
  );
};

export default ReceiptVouchersDirectory;
