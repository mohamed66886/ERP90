// نوع بيانات إذن الصرف كما هو محفوظ في Firebase
interface WarehouseIssueData {
  id: string;
  entryNumber?: string;
  periodRange?: [string | null, string | null];
  issueNumber?: string;
  issueDate?: string;
  refNumber?: string;
  refDate?: string;
  branch?: string;
  warehouse?: string;
  movementType?: string;
  accountType?: string;
  accountNumber?: string;
  accountName?: string;
  sideType?: string;
  sideNumber?: string;
  sideName?: string;
  operationClass?: string;
  statement?: string;
  items?: Array<{
    itemCode: string;
    itemName: string;
    quantity: string;
    unit: string;
    price: string;
    costCenterName: string;
  }>;
}
import React, { useState, useEffect, useMemo } from 'react';
import { Button, Input, Select, DatePicker, Table, Spin, message } from 'antd';
import { useFinancialYear } from '@/hooks/useFinancialYear';
import { SearchOutlined, PrinterOutlined, DownloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { BookOpen } from 'lucide-react';
import Breadcrumb from '@/components/Breadcrumb';
import { fetchWarehouseIssues } from '@/services/warehouseIssueFirebaseService';

const { Option } = Select;

// نموذج بيانات إذن الصرف
interface WarehousePermission {
  key: string;
  id?: string;
  permissionNumber: string;
  date: string;
  branch: string;
  warehouse: string;
  itemNumber: string;
  itemName: string;
  quantity: number;
  unit?: string;
  receiver: string;
  notes?: string;
  accountType?: string;
  accountNumber?: string;
  accountName?: string;
  movementType?: string;
  operationClassification?: string;
  entityType?: string;
}

const ListWarehouse: React.FC = () => {
  // السنة المالية من السياق
  const { currentFinancialYear } = useFinancialYear();
  // حالات البحث
  const [entryNumber, setEntryNumber] = useState<string>(''); // رقم القيد
  const [permissionNumber, setPermissionNumber] = useState<string>(''); // رقم الإذن
  // الفترة المحاسبية أصبحت تعتمد على السنة المالية والفترة المختارة فقط
  const [permissionDate, setPermissionDate] = useState<dayjs.Dayjs | null>(null); // تاريخ الإذن
  const [branchId, setBranchId] = useState<string>('');
  const [warehouseId, setWarehouseId] = useState<string>('');
  const [movementType, setMovementType] = useState<string | null>(null); // نوع الحركة
  const [accountType, setAccountType] = useState<string | null>(null); // نوع الحساب
  const [accountNumber, setAccountNumber] = useState<string>(''); // رقم الحساب
  const [accountName, setAccountName] = useState<string>(''); // اسم الحساب
  const [operationClassification, setOperationClassification] = useState<string>(''); // تصنيف العملية
  const [entityType, setEntityType] = useState<string>(''); // نوع الجهة
  const [itemNumber, setItemNumber] = useState<string>('');
  const [itemName, setItemName] = useState<string>('');
  const [receiver, setReceiver] = useState<string>('');
  const [dateFrom, setDateFrom] = useState<dayjs.Dayjs | null>(null);
  const [dateTo, setDateTo] = useState<dayjs.Dayjs | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  // تعيين الفترة المحاسبية تلقائيًا عند تغيير السنة المالية
  useEffect(() => {
    if (currentFinancialYear) {
      const start = dayjs(currentFinancialYear.startDate);
      const end = dayjs(currentFinancialYear.endDate);
      setDateFrom(start);
      setDateTo(end);
    }
  }, [currentFinancialYear]);

  // بيانات الخيارات (تجلب من API لاحقاً)
  const [branches, setBranches] = useState<{ id: string; name: string }[]>([]);
  const [warehouses, setWarehouses] = useState<{ id: string; name: string }[]>([]);

  // بيانات النتائج
  const [permissions, setPermissions] = useState<WarehousePermission[]>([]);
  const [filteredPermissions, setFilteredPermissions] = useState<WarehousePermission[]>([]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(30);

  // جلب بيانات الخيارات (فروع، مخازن)
  useEffect(() => {
    // TODO: جلب الفروع والمخازن من API
    setBranches([
      { id: '1', name: 'الفرع الرئيسي' },
      { id: '2', name: 'فرع جدة' },
    ]);
    setWarehouses([
      { id: 'w1', name: 'المخزن الرئيسي' },
      { id: 'w2', name: 'مخزن جدة' },
    ]);
  }, []);

  // دالة جلب بيانات الأذونات الحقيقية من Firebase
  const fetchPermissions = async () => {
    setIsLoading(true);
    try {
      const data = await fetchWarehouseIssues();
      // تحويل بيانات الأذونات إلى صفوف الجدول
      const rows: WarehousePermission[] = [];
      (data as WarehouseIssueData[]).forEach((issue) => {
        if (Array.isArray(issue.items)) {
          issue.items.forEach((item, idx: number) => {
            rows.push({
              key: (issue.id || issue.entryNumber || '') + '-' + idx,
              id: issue.entryNumber || '',
              permissionNumber: issue.issueNumber || '',
              date: issue.issueDate || '',
              branch: getBranchName(issue.branch || ''),
              warehouse: getWarehouseName(issue.warehouse || ''),
              itemNumber: item.itemCode || '',
              itemName: item.itemName || '',
              quantity: Number(item.quantity) || 0,
              unit: item.unit || '',
              receiver: issue.sideName || '',
              notes: issue.statement || '',
              accountType: issue.accountType || '',
              accountNumber: issue.accountNumber || '',
              accountName: issue.accountName || '',
              movementType: issue.movementType || '',
              operationClassification: issue.operationClass || '',
              entityType: issue.sideType || '',
            });
          });
        }
      });
      setPermissions(rows);
    } catch (err) {
      message.error('تعذر جلب بيانات أذونات الصرف');
    }
    setIsLoading(false);
  };

  // جلب البيانات عند تحميل الصفحة
  useEffect(() => {
    fetchPermissions();
  }, []);

  // فلترة النتائج حسب البحث
  useEffect(() => {
    let filtered = permissions;
    if (entryNumber) filtered = filtered.filter(p => p.id && p.id.includes(entryNumber));
    if (permissionNumber) filtered = filtered.filter(p => p.permissionNumber.includes(permissionNumber));
    if (permissionDate) filtered = filtered.filter(p => dayjs(p.date).isSame(dayjs(permissionDate), 'day'));
    if (branchId) filtered = filtered.filter(p => p.branch === getBranchName(branchId));
    if (warehouseId) filtered = filtered.filter(p => p.warehouse === getWarehouseName(warehouseId));
    if (movementType) filtered = filtered.filter(p => p.notes && p.notes.includes(movementType));
    if (accountType) filtered = filtered.filter(p => p.notes && p.notes.includes(accountType));
    if (accountNumber) filtered = filtered.filter(p => p.notes && p.notes.includes(accountNumber));
    if (accountName) filtered = filtered.filter(p => p.notes && p.notes.includes(accountName));
    if (operationClassification) filtered = filtered.filter(p => p.notes && p.notes.includes(operationClassification));
    if (entityType) filtered = filtered.filter(p => p.notes && p.notes.includes(entityType));
    if (itemNumber) filtered = filtered.filter(p => p.itemNumber.includes(itemNumber));
    if (itemName) filtered = filtered.filter(p => p.itemName.includes(itemName));
    if (receiver) filtered = filtered.filter(p => p.receiver.includes(receiver));
    if (dateFrom) filtered = filtered.filter(p => dayjs(p.date).isSameOrAfter(dayjs(dateFrom), 'day'));
    if (dateTo) filtered = filtered.filter(p => dayjs(p.date).isSameOrBefore(dayjs(dateTo), 'day'));
    setFilteredPermissions(filtered);
  // eslint-disable-next-line
  }, [permissions, entryNumber, permissionNumber, permissionDate, branchId, warehouseId, movementType, accountType, accountNumber, accountName, operationClassification, entityType, itemName, itemNumber, receiver, dateFrom, dateTo]);

  // تقسيم النتائج على الصفحات
  const paginatedRows = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredPermissions.slice(startIndex, endIndex);
  }, [filteredPermissions, currentPage, pageSize]);

  const totalPages = useMemo(() => {
    return Math.ceil(filteredPermissions.length / pageSize);
  }, [filteredPermissions.length, pageSize]);

  // دوال مساعدة
  const getBranchName = (id: string) => {
    const branch = branches.find(b => b.id === id);
    if (!branch) return id;
    // دعم الاسم العربي أو الإنجليزي إذا توفر
    if ('nameAr' in branch && branch.nameAr) return String(branch.nameAr);
    if ('nameEn' in branch && branch.nameEn) return String(branch.nameEn);
    return String(branch.name || id);
  };
  const getWarehouseName = (id: string) => {
    const warehouse = warehouses.find(w => w.id === id);
    if (!warehouse) return id;
    // دعم الاسم العربي أو الإنجليزي إذا توفر
    if ('nameAr' in warehouse && warehouse.nameAr) return String(warehouse.nameAr);
    if ('nameEn' in warehouse && warehouse.nameEn) return String(warehouse.nameEn);
    return String(warehouse.name || id);
  };

  // عند الضغط على زر البحث
  // زر البحث يعيد جلب البيانات الحقيقية
  const handleSearch = () => {
    fetchPermissions();
    setCurrentPage(1);
  };

  // تصميم موحد لعناصر الإدخال
  const largeControlStyle = {
    height: 44,
    fontSize: 16,
    borderRadius: 8,
    padding: '6px 14px',
    background: '#fff',
    border: '1.5px solid #d9d9d9',
    transition: 'border-color 0.3s',
  };
  const labelStyle = { fontSize: 16, fontWeight: 500, marginBottom: 2, display: 'block' };

  // مكون الإجراءات لكل صف
  const ActionMenu: React.FC<{ onEdit?: () => void; onDelete?: () => void }> = ({ onEdit, onDelete }) => {
    const [open, setOpen] = useState(false);
    // إغلاق القائمة عند فقدان التركيز
    const menuRef = React.useRef<HTMLDivElement>(null);
    useEffect(() => {
      if (!open) return;
      const handleClick = (e: MouseEvent) => {
        if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
          setOpen(false);
        }
      };
      document.addEventListener('mousedown', handleClick);
      return () => document.removeEventListener('mousedown', handleClick);
    }, [open]);
    return (
      <div style={{ display: 'flex', justifyContent: 'center', position: 'relative' }} ref={menuRef}>
        <Button
          type="text"
          icon={<span className="anticon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="5" r="2" fill="#1677ff"/><circle cx="12" cy="12" r="2" fill="#1677ff"/><circle cx="12" cy="19" r="2" fill="#1677ff"/></svg></span>}
          onClick={() => setOpen(o => !o)}
          style={{ padding: 0 }}
        />
        {open && (
          <div style={{ position: 'absolute', top: 32, right: 0, background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.12)', borderRadius: 8, zIndex: 10, minWidth: 100 }}>
            <Button type="text" size="small" style={{ width: '100%', textAlign: 'right', color: '#1677ff', fontWeight: 500 }} onClick={() => { if (onEdit) { onEdit(); } setOpen(false); }}>
              تعديل
            </Button>
            <Button type="text" size="small" danger style={{ width: '100%', textAlign: 'right', fontWeight: 500 }} onClick={() => { if (onDelete) { onDelete(); } setOpen(false); }}>
              حذف
            </Button>
          </div>
        )}
      </div>
    );
  };

  // أعمدة الجدول
  const columns = [
    { title: 'رقم الإذن', dataIndex: 'permissionNumber', key: 'permissionNumber', width: 100, align: 'center' as const },
    { title: 'التاريخ', dataIndex: 'date', key: 'date', width: 160, align: 'center' as const },
    { title: 'نوع الحركة', dataIndex: 'movementType', key: 'movementType', width: 120, align: 'center' as const },
    { title: 'البيان', dataIndex: 'notes', key: 'notes', width: 160, align: 'center' as const },
    { title: 'رقم المرجع', dataIndex: 'entryNumber', key: 'entryNumber', width: 140, align: 'center' as const },
    { title: 'نوع الحساب', dataIndex: 'accountType', key: 'accountType', width: 120, align: 'center' as const },
    { title: 'رقم الحساب', dataIndex: 'accountNumber', key: 'accountNumber', width: 150, align: 'center' as const },
    { title: 'اسم الحساب', dataIndex: 'accountName', key: 'accountName', width: 140, align: 'center' as const },
    { title: 'الفرع', dataIndex: 'branch', key: 'branch', width: 120, align: 'center' as const },
    { title: 'المخزن', dataIndex: 'warehouse', key: 'warehouse', width: 120, align: 'center' as const },
    {
      title: 'الإجراءات',
      key: 'actions',
      width: 120,
      align: 'center' as const,
      render: (_: unknown, record: unknown) => (
        <ActionMenu />
      ),
    },
  ];

  // حالة إظهار المزيد
  const [showMore, setShowMore] = useState(false);
  return (
    <div style={{ padding: 24, background: '#f8f9fa', minHeight: '100vh' }}>
           <div className="p-4 font-['Tajawal'] bg-white mb-4 rounded-lg shadow-[0_0_10px_rgba(0,0,0,0.1)] relative overflow-hidden">
        <div className="flex items-center">
          <BookOpen className="h-8 w-8 text-green-600 ml-3" />
          <h1 className="text-2xl font-bold text-gray-800">دليل اوذونات الصرف</h1>
        </div>
        <p className="text-gray-600 mt-2">قائمة دليل اوذونات الصرف</p>
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-blue-500"></div>
      </div>
            <Breadcrumb
        items={[
          { label: "الرئيسية", to: "/" },
          { label: "إدارة المخازن", to: "/management/warehouse" },
          { label: "أذونات الصرف"  }
        ]}
      />
      {/* جزء خيارات البحث */}
      <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 1px 6px rgba(0,0,0,0.07)', padding: 24, marginBottom: 24 }}>
        <div style={{ marginBottom: 18, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#333', textAlign: 'right', margin: 0 }}>خيارات البحث</h2>
            <SearchOutlined style={{ fontSize: 22, color: '#1677ff' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Button type="primary" size="large" style={{ fontSize: 16, borderRadius: 8, padding: '0 22px' }}>
              + إضافة إذن جديد
            </Button>
            <Button type="default" size="large" style={{ fontSize: 16, borderRadius: 8, padding: '0 18px' }} onClick={() => setShowMore(m => !m)}>
              {showMore ? 'إخفاء المزيد' : 'عرض المزيد'}
            </Button>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* الصف الأول */}
          <div style={{ display: 'flex', gap: 16 }}>
            <div style={{ flex: 1, minWidth: 140 }}>
              <label style={labelStyle}>رقم القيد</label>
              <Input value={entryNumber} onChange={e => setEntryNumber(e.target.value)} style={largeControlStyle} placeholder="رقم القيد" allowClear />
            </div>
            <div style={{ flex: 1, minWidth: 140 }}>
              <label style={labelStyle}>رقم الإذن</label>
              <Input value={permissionNumber} onChange={e => setPermissionNumber(e.target.value)} style={largeControlStyle} placeholder="رقم الإذن" allowClear />
            </div>
            <div style={{ flex: 1, minWidth: 140 }}>
              <label style={labelStyle}>الفترة المحاسبية</label>
              <DatePicker.RangePicker
                value={[dateFrom ? dayjs(dateFrom) : null, dateTo ? dayjs(dateTo) : null]}
                onChange={dates => {
                  setDateFrom(dates && dates[0] ? dates[0] : null);
                  setDateTo(dates && dates[1] ? dates[1] : null);
                }}
                format="YYYY-MM-DD"
                style={{ ...largeControlStyle, width: '100%' }}
                placeholder={["من تاريخ", "إلى تاريخ"]}
                allowClear
              />
            </div>
            <div style={{ flex: 1, minWidth: 140 }}>
              <label style={labelStyle}>تاريخ الإذن</label>
              <DatePicker value={permissionDate ? dayjs(permissionDate) : null} onChange={d => setPermissionDate(d)} style={{ ...largeControlStyle, width: '100%' }} placeholder="تاريخ الإذن" format="YYYY-MM-DD" allowClear />
            </div>
            <div style={{ flex: 1, minWidth: 140 }}>
              <label style={labelStyle}>الفرع</label>
              <Select value={branchId} onChange={setBranchId} style={{ ...largeControlStyle, width: '100%' }} placeholder="اختر الفرع" allowClear>
                {branches.map(b => <Option key={b.id} value={b.id}>{b.name}</Option>)}
              </Select>
            </div>
          </div>
          {/* الصف الثاني */}
          <div style={{ display: 'flex', gap: 16 }}>
            <div style={{ flex: 1, minWidth: 140 }}>
              <label style={labelStyle}>المخزن</label>
              <Select value={warehouseId} onChange={setWarehouseId} style={{ ...largeControlStyle, width: '100%' }} placeholder="اختر المخزن" allowClear>
                {warehouses.map(w => <Option key={w.id} value={w.id}>{w.name}</Option>)}
              </Select>
            </div>
            <div style={{ flex: 1, minWidth: 140 }}>
              <label style={labelStyle}>نوع الحركة</label>
              <Select
                value={movementType}
                onChange={setMovementType}
                placeholder="اختر نوع الحركة"
                allowClear
                style={{ ...largeControlStyle, width: '100%' }}
              >
                <Option value="صرف">صرف - Out</Option>
                <Option value="مردودات مشتريات">مردودات مشتريات - Returns purchases</Option>
                <Option value="سند تحويل">سند تحويل - Document transfer</Option>
                <Option value="تسوية عجز">تسوية عجز - Settlement</Option>
                <Option value="فاتورة مبيعات">فاتورة مبيعات - Sales invoice</Option>
                <Option value="أمر تصنيع">أمر تصنيع - Manufacturing order</Option>
                <Option value="أمر بيع">أمر بيع - Sales Order</Option>
                <Option value="إغلاق المخزون">إغلاق المخزون - Close Inventory</Option>
                <Option value="صرف من طلب مواد">صرف من طلب مواد - Out-Items_Request</Option>
                <Option value="صرف من طلب توريد">صرف من طلب توريد - Supply_Request</Option>
                <Option value="تسليم من مستند فك / فرز">تسليم من مستند فك / فرز</Option>
              </Select>
            </div>
            <div style={{ flex: 1, minWidth: 140 }}>
              <label style={labelStyle}>نوع الحساب</label>
              <Select
                value={accountType}
                onChange={setAccountType}
                placeholder="اختر نوع الحساب"
                allowClear
                style={{ ...largeControlStyle, width: '100%' }}
              >
                <Option value="مورد">مورد</Option>
                <Option value="عميل">عميل</Option>
              </Select>
            </div>
            <div style={{ flex: 1, minWidth: 140 }}>
              <label style={labelStyle}>رقم الحساب</label>
              <Input value={accountNumber} onChange={e => setAccountNumber(e.target.value)} style={largeControlStyle} placeholder="رقم الحساب" allowClear />
            </div>
            <div style={{ flex: 1, minWidth: 140 }}>
              <label style={labelStyle}>اسم الحساب</label>
              <Input value={accountName} onChange={e => setAccountName(e.target.value)} style={largeControlStyle} placeholder="اسم الحساب" allowClear />
            </div>
          </div>
          {/* الصفوف الإضافية تظهر فقط عند showMore */}
          {showMore && (
            <>
              {/* الصف الثالث */}
              <div style={{ display: 'flex', gap: 16 }}>
                <div style={{ flex: 1, minWidth: 140 }}>
                  <label style={labelStyle}>تصنيف العملية</label>
                  <Input value={operationClassification} onChange={e => setOperationClassification(e.target.value)} style={largeControlStyle} placeholder="تصنيف العملية" allowClear />
                </div>
                <div style={{ flex: 1, minWidth: 140 }}>
                  <label style={labelStyle}>نوع الجهة</label>
                  <Input value={entityType} onChange={e => setEntityType(e.target.value)} style={largeControlStyle} placeholder="نوع الجهة" allowClear />
                </div>
                <div style={{ flex: 1, minWidth: 140 }}>
                  <label style={labelStyle}>رقم الصنف</label>
                  <Input value={itemNumber} onChange={e => setItemNumber(e.target.value)} style={largeControlStyle} placeholder="رقم الصنف" allowClear />
                </div>
                <div style={{ flex: 1, minWidth: 160 }}>
                  <label style={labelStyle}>اسم الصنف</label>
                  <Input value={itemName} onChange={e => setItemName(e.target.value)} style={largeControlStyle} placeholder="اسم الصنف" allowClear />
                </div>
                <div style={{ flex: 1, minWidth: 140 }}>
                  <label style={labelStyle}>المستلم</label>
                  <Input value={receiver} onChange={e => setReceiver(e.target.value)} style={largeControlStyle} placeholder="اسم المستلم" allowClear />
                </div>
              </div>
              {/* الصف الرابع */}
              <div style={{ display: 'flex', gap: 16, alignItems: 'flex-end' }}>
                <div style={{ flex: 1, minWidth: 140 }}>
                  <label style={labelStyle}>من تاريخ</label>
                  <DatePicker value={dateFrom ? dayjs(dateFrom) : null} onChange={d => setDateFrom(d)} style={{ ...largeControlStyle, width: '100%' }} placeholder="من تاريخ" format="YYYY-MM-DD" allowClear />
                </div>
                <div style={{ flex: 1, minWidth: 140 }}>
                  <label style={labelStyle}>إلى تاريخ</label>
                  <DatePicker value={dateTo ? dayjs(dateTo) : null} onChange={d => setDateTo(d)} style={{ ...largeControlStyle, width: '100%' }} placeholder="إلى تاريخ" format="YYYY-MM-DD" allowClear />
                </div>
                <div style={{ flex: 2 }}></div>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, marginTop: 8, justifyContent: 'flex-end' }}>
                  <Button type="primary" size="large" style={{ height: 44, fontSize: 16, borderRadius: 8 }} onClick={handleSearch}>
                    بحث
                  </Button>
                  <span style={{ fontSize: 16, fontWeight: 500, color: '#555', marginRight: 8 }}>
                    عدد النتائج: {filteredPermissions.length}
                  </span>
                </div>
              </div>
            </>
          )}
          {/* زر البحث وعدد النتائج يظهر في الصف الثاني إذا لم يكن showMore */}
          {!showMore && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8, justifyContent: 'flex-end' }}>
              <Button type="primary" size="large" style={{ height: 44, fontSize: 16, borderRadius: 8 }} onClick={handleSearch}>
                بحث
              </Button>
              <span style={{ fontSize: 16, fontWeight: 500, color: '#555', marginRight: 8 }}>
                عدد النتائج: {filteredPermissions.length}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* جزء النتائج */}
      <div style={{ background: '#fff', borderRadius: 12, padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#333', textAlign: 'right', margin: 0 }}>نتائج أذونات الصرف</h2>
          <div style={{ display: 'flex', gap: 10 }}>
            <Button type="primary" size="large" style={{ fontSize: 16, borderRadius: 8, background: '#1677ff', borderColor: '#1677ff', display: 'flex', alignItems: 'center', gap: 6 }} onClick={() => window.print()}>
              <PrinterOutlined /> طباعة
            </Button>
            <Button type="primary" size="large" style={{ fontSize: 16, borderRadius: 8, background: '#1677ff', borderColor: '#1677ff', display: 'flex', alignItems: 'center', gap: 6 }} onClick={() => handleExport()}>
              <DownloadOutlined /> تصدير
            </Button>
          </div>
        </div>
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: 40 }}><Spin size="large" /></div>
        ) : (
          <Table
            columns={columns}
            dataSource={paginatedRows}
            pagination={{
              current: currentPage,
              pageSize,
              total: filteredPermissions.length,
              onChange: setCurrentPage,
              showSizeChanger: false,
              position: ['bottomCenter'],
            }}
            rowKey="key"
            bordered
            scroll={{ x: 'max-content' }}
            style={{ background: '#fff' }}
            className="custom-warehouse-table"
          />
        )}
      </div>
    </div>
  );
};

// دالة تصدير النتائج إلى CSV
function handleExport() {
  // يمكنك تحسين التصدير لاحقاً حسب الحاجة
  const rows = document.querySelectorAll('table tr');
  const csv = [];
  rows.forEach(row => {
    const cols = row.querySelectorAll('td,th');
    const rowData = Array.from(cols).map(col => '"' + (col.textContent ? col.textContent.replace(/"/g, '""') : '') + '"').join(',');
    csv.push(rowData);
  });
  const csvContent = csv.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.setAttribute('download', 'warehouse_permissions.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export default ListWarehouse;

// إضافة ستايل مخصص للجدول
const style = document.createElement('style');
style.innerHTML = `
  .custom-warehouse-table .ant-table-thead > tr > th {
    background: #e3f0ff !important;
    color: #1557a3 !important;
    font-weight: 700;
    font-size: 16px;
  }
`;
document.head.appendChild(style);
