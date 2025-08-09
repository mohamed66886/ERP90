import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Table, 
  Card, 
  Input, 
  Button, 
  Space, 
  DatePicker, 
  Select, 
  Tag, 
  message,
  Row,
  Col,
  Typography
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { SearchOutlined, EditOutlined, EyeOutlined, FilterOutlined } from '@ant-design/icons';
import { collection, getDocs, query, orderBy, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Breadcrumb from '@/components/Breadcrumb';
import dayjs from 'dayjs';
import 'dayjs/locale/ar';

const { Title } = Typography;
const { RangePicker } = DatePicker;

dayjs.locale('ar');

interface InvoiceRecord {
  key: string;
  id: string;
  invoiceNumber: string;
  entryNumber?: string;
  date: string;
  customerName: string;
  customerPhone?: string;
  total: number;
  paymentMethod: string;
  branch: string;
  warehouse: string;
  delegate?: string;
  status?: string;
  itemsCount?: number;
}

const EditSalesInvoicePage: React.FC = () => {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<InvoiceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  const [branches, setBranches] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<string[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<string>('');
  const [invoiceNumberSimple, setInvoiceNumberSimple] = useState<string>('');

  // جلب البيانات من Firebase
  useEffect(() => {
    fetchInvoices();
    fetchBranches();
    fetchWarehouses();
  }, []);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const invoicesRef = collection(db, 'sales_invoices');
      const q = query(invoicesRef, orderBy('date', 'desc'));
      const snapshot = await getDocs(q);
      
      const invoicesData: InvoiceRecord[] = [];
      const paymentMethodsSet = new Set<string>();

      snapshot.forEach((doc) => {
        const data = doc.data();
        paymentMethodsSet.add(data.paymentMethod || 'غير محدد');
        
        invoicesData.push({
          key: doc.id,
          id: doc.id,
          invoiceNumber: data.invoiceNumber || '',
          entryNumber: data.entryNumber || '',
          date: data.date || '',
          customerName: data.customerName || 'غير محدد',
          customerPhone: data.customerNumber || '',
          total: data.totals?.total || 0,
          paymentMethod: data.paymentMethod || 'غير محدد',
          branch: data.branch || '',
          warehouse: data.warehouse || '',
          delegate: data.delegate || '',
          status: 'مكتمل',
          itemsCount: data.items?.length || 0
        });
      });

      setInvoices(invoicesData);
      setFilteredInvoices(invoicesData);
      setPaymentMethods(Array.from(paymentMethodsSet));
    } catch (error) {
      console.error('Error fetching invoices:', error);
      message.error('حدث خطأ في جلب البيانات');
    } finally {
      setLoading(false);
    }
  };

  const fetchBranches = async () => {
    try {
      const branchesRef = collection(db, 'branches');
      const snapshot = await getDocs(branchesRef);
      const branchesData = snapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name || doc.data().nameAr || '',
        ...doc.data()
      }));
      setBranches(branchesData);
    } catch (error) {
      console.error('Error fetching branches:', error);
    }
  };

  const fetchWarehouses = async () => {
    try {
      const warehousesRef = collection(db, 'warehouses');
      const snapshot = await getDocs(warehousesRef);
      const warehousesData = snapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name || doc.data().nameAr || '',
        ...doc.data()
      }));
      setWarehouses(warehousesData);
    } catch (error) {
      console.error('Error fetching warehouses:', error);
    }
  };

  // البحث والفلترة
  useEffect(() => {
    let filtered = [...invoices];

    // البحث بالنص
    if (searchText) {
      filtered = filtered.filter(invoice =>
        invoice.invoiceNumber.toLowerCase().includes(searchText.toLowerCase()) ||
        invoice.customerName.toLowerCase().includes(searchText.toLowerCase()) ||
        invoice.customerPhone?.includes(searchText) ||
        invoice.entryNumber?.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // البحث بالفرع
    if (selectedBranch) {
      filtered = filtered.filter(invoice => invoice.branch === selectedBranch);
    }

    // البحث برقم الفاتورة المبسط
    if (invoiceNumberSimple) {
      filtered = filtered.filter(invoice => {
        // استخراج الرقم الأخير من رقم الفاتورة
        // مثال: INV-12-20250809-3 -> 3
        const parts = invoice.invoiceNumber.split('-');
        const lastPart = parts[parts.length - 1];
        return lastPart === invoiceNumberSimple;
      });
    }

    // فلتر التاريخ
    if (dateRange) {
      filtered = filtered.filter(invoice => {
        const invoiceDate = dayjs(invoice.date);
        return invoiceDate.isSameOrAfter(dateRange[0], 'day') && 
               invoiceDate.isSameOrBefore(dateRange[1], 'day');
      });
    }

    // فلتر طريقة الدفع
    if (selectedPaymentMethod) {
      filtered = filtered.filter(invoice => invoice.paymentMethod === selectedPaymentMethod);
    }

    setFilteredInvoices(filtered);
  }, [searchText, dateRange, selectedPaymentMethod, invoices, selectedBranch, invoiceNumberSimple]);

  const getBranchName = (branchId: string) => {
    const branch = branches.find(b => b.id === branchId);
    return branch?.name || branchId;
  };

  const getWarehouseName = (warehouseId: string) => {
    const warehouse = warehouses.find(w => w.id === warehouseId);
    return warehouse?.name || warehouseId;
  };

  const handleEditInvoice = (record: InvoiceRecord) => {
    navigate(`/stores/edit-sales-invoice/${record.id}`);
  };

  const handleViewInvoice = (record: InvoiceRecord) => {
    // يمكن إضافة صفحة عرض الفاتورة لاحقاً
    message.info('ستتم إضافة صفحة عرض الفاتورة قريباً');
  };

  const clearFilters = () => {
    setSearchText('');
    setDateRange(null);
    setSelectedPaymentMethod('');
    setSelectedBranch('');
    setInvoiceNumberSimple('');
  };

  const columns: ColumnsType<InvoiceRecord> = [
    {
      title: 'رقم الفاتورة',
      dataIndex: 'invoiceNumber',
      key: 'invoiceNumber',
      width: 150,
      render: (text) => <Tag color="blue">{text}</Tag>
    },
    {
      title: 'رقم القيد',
      dataIndex: 'entryNumber',
      key: 'entryNumber',
      width: 120,
      render: (text) => <span style={{ fontSize: '12px', color: '#666' }}>{text}</span>
    },
    {
      title: 'التاريخ',
      dataIndex: 'date',
      key: 'date',
      width: 120,
      render: (date) => dayjs(date).format('YYYY/MM/DD')
    },
    {
      title: 'اسم العميل',
      dataIndex: 'customerName',
      key: 'customerName',
      width: 150,
      ellipsis: true
    },
    {
      title: 'رقم الهاتف',
      dataIndex: 'customerPhone',
      key: 'customerPhone',
      width: 120
    },
    {
      title: 'إجمالي الفاتورة',
      dataIndex: 'total',
      key: 'total',
      width: 120,
      render: (total) => (
        <span style={{ fontWeight: 'bold', color: '#1890ff' }}>
          {total.toLocaleString()} ر.س
        </span>
      )
    },
    {
      title: 'طريقة الدفع',
      dataIndex: 'paymentMethod',
      key: 'paymentMethod',
      width: 100,
      render: (method) => (
        <Tag color={method === 'نقدي' ? 'green' : method === 'آجل' ? 'orange' : 'blue'}>
          {method}
        </Tag>
      )
    },
    {
      title: 'الفرع',
      dataIndex: 'branch',
      key: 'branch',
      width: 120,
      render: (branchId) => getBranchName(branchId)
    },
    {
      title: 'المخزن',
      dataIndex: 'warehouse',
      key: 'warehouse',
      width: 120,
      render: (warehouseId) => getWarehouseName(warehouseId)
    },
    {
      title: 'عدد الأصناف',
      dataIndex: 'itemsCount',
      key: 'itemsCount',
      width: 100,
      render: (count) => <Tag>{count}</Tag>
    },
    {
      title: 'الإجراءات',
      key: 'actions',
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEditInvoice(record)}
            title="تعديل الفاتورة"
          />
          <Button
            icon={<EyeOutlined />}
            size="small"
            onClick={() => handleViewInvoice(record)}
            title="عرض الفاتورة"
          />
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: '24px', direction: 'rtl' }}>
      <style>{`
        .table-row:hover {
          background-color: #f0f8ff !important;
          transform: scale(1.01);
          transition: all 0.2s ease-in-out;
        }
        .ant-table-tbody > tr:hover > td {
          background-color: #f0f8ff !important;
        }
        .ant-table-tbody > tr {
          cursor: pointer;
          transition: all 0.2s ease-in-out;
        }
        .ant-table-tbody > tr:hover {
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
      `}</style>
      {/* Header */}
      <Card style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
          <EditOutlined style={{ fontSize: '32px', color: '#1890ff', marginLeft: '16px' }} />
          <div>
            <Title level={2} style={{ margin: 0, textAlign: 'right' }}>
              تعديل فواتير المبيعات
            </Title>
            <p style={{ textAlign: 'right', color: '#666', margin: '8px 0 0 0' }}>
              إدارة وتعديل فواتير المبيعات الموجودة
            </p>
          </div>
        </div>
      </Card>

      <Breadcrumb
        items={[
          { label: 'الرئيسية', to: '/' },
          { label: 'إدارة المبيعات', to: '/management/sales' },
          { label: 'تعديل فواتير المبيعات' }
        ]}
      />

      {/* Filters */}
      <Card style={{ marginBottom: '24px' }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={8} lg={6}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#333' }}>
                البحث العام:
              </label>
              <Input
                placeholder="البحث باسم العميل أو رقم الهاتف..."
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                allowClear
              />
            </div>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#333' }}>
                الفرع:
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <Select
                  style={{ flex: 1 }}
                  placeholder="اختر الفرع"
                  value={selectedBranch}
                  onChange={setSelectedBranch}
                  allowClear
                >
                  {branches.map(branch => (
                    <Select.Option key={branch.id} value={branch.id}>
                      {branch.name}
                    </Select.Option>
                  ))}
                </Select>
                <Input
                  placeholder="رقم"
                  value={invoiceNumberSimple}
                  onChange={(e) => setInvoiceNumberSimple(e.target.value)}
                  allowClear
                  style={{ width: '70px', textAlign: 'center' }}
                />
              </div>
            </div>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#333' }}>
                فترة التاريخ:
              </label>
              <RangePicker
                style={{ width: '100%' }}
                placeholder={['من تاريخ', 'إلى تاريخ']}
                value={dateRange}
                onChange={setDateRange}
                format="YYYY/MM/DD"
              />
            </div>
          </Col>
        </Row>
        <Row gutter={[16, 16]} align="middle" style={{ marginTop: '16px' }}>
          <Col xs={24} sm={12} md={8} lg={6}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#333' }}>
                طريقة الدفع:
              </label>
              <Select
                style={{ width: '100%' }}
                placeholder="اختر طريقة الدفع"
                value={selectedPaymentMethod}
                onChange={setSelectedPaymentMethod}
                allowClear
              >
                {paymentMethods.map(method => (
                  <Select.Option key={method} value={method}>
                    {method}
                  </Select.Option>
                ))}
              </Select>
            </div>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#333' }}>
                الإجراءات:
              </label>
              <Space>
                <Button
                  icon={<FilterOutlined />}
                  onClick={clearFilters}
                  title="مسح الفلاتر"
                >
                  مسح الفلاتر
                </Button>
              </Space>
            </div>
          </Col>
        </Row>
      </Card>

      {/* Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredInvoices}
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} من ${total} فاتورة`,
            pageSizeOptions: ['10', '20', '50', '100']
          }}
          scroll={{ x: 1400 }}
          size="small"
          rowClassName="table-row"
          onRow={(record) => ({
            onClick: () => handleEditInvoice(record),
            style: { cursor: 'pointer' }
          })}
        />
      </Card>
    </div>
  );
};

export default EditSalesInvoicePage;
