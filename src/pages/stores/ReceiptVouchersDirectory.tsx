
import React, { useEffect, useState } from 'react';
import { SearchOutlined as SearchIcon } from '@ant-design/icons';
import { Card, Row, Col, Input, Button, DatePicker, Select, Table, Space, message, Modal } from 'antd';
import './ReceiptVouchersDirectory.css';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
dayjs.extend(isBetween);
// استيراد firebase
import { collection, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

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
  // قائمة البنوك من قاعدة البيانات (لعمود البنك)
  const [bankOptions, setBankOptions] = useState<{ value: string; label: string }[]>([]);
  useEffect(() => {
    const fetchBanks = async () => {
      try {
        const bankSnapshot = await getDocs(collection(db, 'bankAccounts'));
        const banks = bankSnapshot.docs.map(doc => ({
          value: doc.id,
          label: doc.data().arabicName || doc.data().name || doc.id
        }));
        setBankOptions(banks);
      } catch (err) {
        setBankOptions([]);
      }
    };
    fetchBanks();
  }, []);
  // قائمة أسماء الصناديق والبنوك من قاعدة البيانات
  const [cashboxBankOptions, setCashboxBankOptions] = useState<{ value: string; label: string }[]>([]);
  useEffect(() => {
    const fetchCashboxesAndBanks = async () => {
      try {
        // جلب الصناديق
        const cashboxSnapshot = await getDocs(collection(db, 'cashBoxes'));
        const cashboxes = cashboxSnapshot.docs.map(doc => ({
          value: `cashbox-${doc.id}`,
          label: doc.data().nameAr || doc.data().name || doc.id
        }));
        // جلب البنوك
        const bankSnapshot = await getDocs(collection(db, 'bankAccounts'));
        const banks = bankSnapshot.docs.map(doc => ({
          value: `bank-${doc.id}`,
          label: doc.data().arabicName || doc.data().name || doc.id
        }));
        setCashboxBankOptions([...cashboxes, ...banks]);
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
  // Dummy data for modals (replace with real data if needed)
  const customerAccounts = [
    { code: '1001', nameAr: 'عميل 1', mobile: '01000000001', taxNumber: '123456' },
    { code: '1002', nameAr: 'عميل 2', mobile: '01000000002', taxNumber: '654321' },
  ];
  const supplierAccounts = [
    { code: '2001', nameAr: 'مورد 1', mobile: '01100000001' },
    { code: '2002', nameAr: 'مورد 2', mobile: '01100000002' },
  ];
  const collectorAccounts = [
    { number: '1', name: 'محصل 1', mobile: '01200000001', id: 'c1' },
    { number: '2', name: 'محصل 2', mobile: '01200000002', id: 'c2' },
  ];
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
  // جلب الفروع من قاعدة البيانات
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const q = collection(db, 'branches');
        const snapshot = await getDocs(q);
        const branches = snapshot.docs.map(doc => {
          const d = doc.data();
          return {
            value: doc.id,
            label: d.name || doc.id
          };
        });
        setBranchOptions([{ value: '', label: 'كل الفروع' }, ...branches]);
      } catch (err) {
        // يمكن تجاهل الخطأ أو إظهاره
      }
    };
    fetchBranches();
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

  return (
    <div style={{ padding: 24 }}>
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
              <Select placeholder="الفرع" value={searchBranch} onChange={v => setSearchBranch(v)} style={{ width: '100%', ...largeControlStyle }} size="large">
                {branchOptions.map(opt => (
                  <Option key={opt.value} value={opt.value}>{opt.label}</Option>
                ))}
              </Select>
            </Col>
            <Col span={4}>
              <span style={labelStyle}>الحساب الدائن</span>
              <Select
                placeholder="الحساب الدائن"
                value={searchDebitAccount}
                onChange={v => setSearchDebitAccount(v)}
                allowClear
                style={{ width: '100%', ...largeControlStyle }}
                size="large"
              >
                <Option value="">كل الحسابات</Option>
                <Option value="acc3">حساب العملاء</Option>
                <Option value="acc4">حساب الموردين</Option>
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
                  <SearchIcon style={{ color: '#1677ff', cursor: 'pointer' }} onClick={() => setShowCustomerModal(true)} />
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
                  <SearchIcon style={{ color: '#1677ff', cursor: 'pointer' }} onClick={() => setShowSupplierModal(true)} />
                
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
                  <SearchIcon style={{ color: '#1677ff', cursor: 'pointer' }} onClick={() => setShowCollectorModal(true)} />
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
              <Select placeholder="طريقة الدفع" value={searchPaymentMethod} onChange={v => setSearchPaymentMethod(v)} style={{ width: '100%', ...largeControlStyle }} size="large">
                {paymentMethodOptions.map(opt => (
                  <Option key={opt.value} value={opt.value}>{opt.label}</Option>
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
