import React, { useState, useEffect } from "react";
import { Modal, Table } from "antd";
import { getAccounts } from "@/lib/accountsService";
import { fetchBranches, Branch } from "@/lib/branches";
import { fetchWarehouses } from "@/lib/warehouses";

// تعريف نوع Warehouse مع خصائص الربط بالفرع
interface Warehouse {
  id: string;
  name?: string;
  nameAr?: string;
  branch?: string; // ربط المخزن بالفرع
  allowedBranches?: string[]; // الفروع المسموح بها
}
import dayjs from "dayjs";
import * as XLSX from "xlsx";
import { useFinancialYear } from "@/hooks/useFinancialYear";
import { Button, Input, Select, DatePicker, Tabs, Upload, message } from "antd";
import styles from './ReceiptVoucher.module.css';
import { FileTextOutlined, UploadOutlined } from "@ant-design/icons";
import { GiMagicBroom } from "react-icons/gi";
import ItemSearchModal from "@/components/ItemSearchModal";
import Breadcrumb from "@/components/Breadcrumb";
const { TabPane } = Tabs;

const IssueWarehousePage = () => {
  // حالة الأصناف المضافة
  const [addedItems, setAddedItems] = useState<Array<{ itemCode: string; itemName: string; quantity: string; unit: string; price: string; costCenterName: string }>>([]);

  // أعمدة الجدول
  const itemColumns = [
    { title: 'رقم الصنف', dataIndex: 'itemCode', key: 'itemCode', width: 100 },
    { title: 'اسم الصنف', dataIndex: 'itemName', key: 'itemName', width: 150 },
    { title: 'الكمية', dataIndex: 'quantity', key: 'quantity', width: 80 },
    { title: 'الوحدة', dataIndex: 'unit', key: 'unit', width: 80 },
    { title: 'السعر', dataIndex: 'price', key: 'price', width: 100 },
    { title: 'مركز التكلفة', dataIndex: 'costCenterName', key: 'costCenterName', width: 120 },
    { title: 'إجراءات', key: 'actions', width: 80, render: (_: unknown, record: { itemCode: string }, idx: number) => (
      <Button danger size="small" onClick={() => {
        setAddedItems(items => items.filter((_, i) => i !== idx));
      }}>حذف</Button>
    ) }
  ];

  // إضافة صنف للجدول
  const handleAddItem = () => {
    const finalUnit = unit && unit.trim() ? unit : "قطعة";
    if (
      !itemCode.trim() ||
      !itemName.trim() ||
      !finalUnit.trim() ||
      !quantity || Number(quantity) <= 0 ||
      !price || Number(price) <= 0
    ) {
      return message.error('يرجى إدخال جميع بيانات الصنف بشكل صحيح');
    }
    setAddedItems(items => [...items, { itemCode, itemName, quantity, unit: finalUnit, price, costCenterName }]);
    setItemCode('');
    setItemName('');
    setQuantity('1');
    setUnit('');
    setPrice('');
    setCostCenterName('');
  };

  // حفظ وطباعة مع تحقق من المدخلات المطلوبة
  const handleSaveAndPrint = () => {
    if (!branch) return message.error('يرجى اختيار الفرع');
    if (!warehouse) return message.error('يرجى اختيار المخزن');
    if (!accountType) return message.error('يرجى اختيار نوع الحساب');
    if (!accountNumber) return message.error('يرجى إدخال رقم الحساب');
    if (!accountName) return message.error('يرجى إدخال اسم الحساب');
    if (!addedItems.length) return message.error('يرجى إضافة الأصناف');

    // تحويل التواريخ إلى نصوص قبل الحفظ
    const saveData = {
      entryNumber,
      periodRange: [
        periodRange[0] ? periodRange[0].format('YYYY-MM-DD') : null,
        periodRange[1] ? periodRange[1].format('YYYY-MM-DD') : null
      ],
      issueNumber,
      issueDate: issueDate ? issueDate.format('YYYY-MM-DD') : null,
      refNumber,
      refDate: refDate ? refDate.format('YYYY-MM-DD') : null,
      branch,
      warehouse,
      movementType,
      accountType,
      accountNumber,
      accountName,
      sideType,
      sideNumber,
      sideName,
      operationClass,
      statement,
      items: addedItems
    };
    console.log('بيانات الحفظ المرسلة إلى :', saveData);
    import("@/services/warehouseIssueFirebaseService").then(({ saveWarehouseIssueToFirebase }) => {
      saveWarehouseIssueToFirebase(saveData)
      .then(() => {
        message.success('تم حفظ البيانات بنجاح');
        setAddedItems([]);
      })
      .catch((err) => {
        console.error('خطأ :', err);
        message.error('حدث خطأ أثناء حفظ البيانات: ' + (err?.message || '')); 
      });
    });
  };
  // بيانات إذن الصرف
  // رقم القيد تلقائي
  const [entryNumber, setEntryNumber] = useState("");

  // توليد رقم قيد تلقائي عند تحميل الصفحة
  useEffect(() => {
    // مثال: رقم عشوائي مكون من 8 أرقام ويمكن تعديله حسب النظام
    const autoNumber = `EN-${Date.now().toString().slice(-6)}`;
    setEntryNumber(autoNumber);
  }, []);
  const [periodRange, setPeriodRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null]>([null, null]);

  // السنة المالية من السياق
  const { currentFinancialYear } = useFinancialYear();

  // تعيين الفترة المحاسبية حسب السنة المالية
  useEffect(() => {
    if (currentFinancialYear) {
      const start = dayjs(currentFinancialYear.startDate);
      const end = dayjs(currentFinancialYear.endDate);
      setPeriodRange([start, end]);
    }
  }, [currentFinancialYear]);
  // رقم الإذن تلقائي
  const [issueNumber, setIssueNumber] = useState("");

  // توليد رقم إذن تلقائي عند تحميل الصفحة
  useEffect(() => {
    const autoIssueNumber = `IS-${Date.now().toString().slice(-6)}`;
    setIssueNumber(autoIssueNumber);
  }, []);
  // تاريخ الإذن الافتراضي هو اليوم
  const [issueDate, setIssueDate] = useState(dayjs());
  const [refNumber, setRefNumber] = useState("");
  const [refDate, setRefDate] = useState(null);
  const [branch, setBranch] = useState(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  // جلب بيانات الفروع الحقيقية
  useEffect(() => {
    fetchBranches().then((branches: Branch[]) => setBranches(branches)).catch(() => setBranches([]));
  }, []);
  const [warehouse, setWarehouse] = useState(null);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  // جلب بيانات المخازن الحقيقية
  useEffect(() => {
    fetchWarehouses().then((warehouses: Warehouse[]) => setWarehouses(warehouses)).catch(() => setWarehouses([]));
  }, []);

  // عند تغيير الفرع، فلترة المخازن واختيار أول مخزن مرتبط
  useEffect(() => {
    if (!branch || !warehouses.length) return;
    // بعض المخازن قد يكون لها خاصية branch أو branchId أو allowedBranches أو branchCode
    // سنبحث عن المخزن المرتبط بالفرع المختار
    const filtered = warehouses.filter(w => {
      if (w.branch) return w.branch === branch;
      if (w.allowedBranches && Array.isArray(w.allowedBranches)) return w.allowedBranches.includes(branch);
      // دعم branchCode و allowedBranchCodes لو موجودين
      if ('branchCode' in w && typeof (w as any).branchCode === 'string') return (w as any).branchCode === branch;
      if ('allowedBranchCodes' in w && Array.isArray((w as any).allowedBranchCodes)) return (w as any).allowedBranchCodes.includes(branch);
      return false;
    });
    if (filtered.length) {
      setWarehouse(filtered[0].id);
    } else {
      setWarehouse(null);
    }
  }, [branch, warehouses]);
  const [movementType, setMovementType] = useState(null);
  const [accountType, setAccountType] = useState(null);
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  // مودال البحث عن الحساب
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [accountSearch, setAccountSearch] = useState("");
  const [accountModalType, setAccountModalType] = useState("عميل"); // "عميل" أو "مورد"
  const [customerAccounts, setCustomerAccounts] = useState<{ code: string; nameAr: string; mobile?: string; taxNumber?: string }[]>([]);
  const [supplierAccounts, setSupplierAccounts] = useState<{ code: string; nameAr: string; mobile?: string }[]>([]);
  // جلب بيانات العملاء الحقيقية
  useEffect(() => {
    if (showAccountModal && accountModalType === "عميل") {
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
  }, [showAccountModal, accountModalType]);

  // جلب بيانات الموردين الحقيقية
  useEffect(() => {
    if (showAccountModal && accountModalType === "مورد") {
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
  }, [showAccountModal, accountModalType]);
  const [sideType, setSideType] = useState(null);
  const [sideNumber, setSideNumber] = useState("");
  const [sideName, setSideName] = useState("");
  const [operationClass, setOperationClass] = useState(null);
  const [statement, setStatement] = useState("");

  // تبويب الأصناف
  const [activeTab, setActiveTab] = useState("new");
  // صنف جديد
  const [itemCode, setItemCode] = useState("");
  const [itemName, setItemName] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [unit, setUnit] = useState("");
  const [price, setPrice] = useState("");
  const [costCenterNumber, setCostCenterNumber] = useState("");
  const [costCenterName, setCostCenterName] = useState("");
  const [additionWeight, setAdditionWeight] = useState("");
  const [showItemModal, setShowItemModal] = useState(false);

  // عند تغيير التبويب لصنف جديد، اجعل الكمية 1
  useEffect(() => {
    if (activeTab === "new") {
      setQuantity("1");
    }
  }, [activeTab]);

  // استيراد من ملف إكسل
  const [excelFile, setExcelFile] = useState(null);

  const handleExcelUpload = (info: { file: { status: string; name: string; originFileObj: File } }) => {
  if (info.file.status === "done") {
    message.success(`${info.file.name} تم رفع الملف بنجاح`);
    setExcelFile(info.file.originFileObj);
    // قراءة ملف الإكسل وتحويله إلى أصناف
    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      const data = new Uint8Array(e.target!.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as string[][];
      // توقع أن أول صف هو رؤوس الأعمدة أو بيانات مباشرة
      const items = rows
        .filter((row: string[]) => Array.isArray(row) && row.length >= 6)
        .map((row: string[]) => ({
          itemCode: String(row[0] || ""),
          itemName: String(row[1] || ""),
          quantity: String(row[2] || "1"),
          unit: String(row[3] || "قطعة"),
          price: String(row[4] || ""),
          costCenterName: String(row[5] || "")
        }))
        .filter(item => item.itemCode && item.itemName && item.quantity && item.unit && item.price);
      if (!items.length) {
        message.error("لم يتم العثور على أصناف صالحة في الملف");
        return;
      }
      setAddedItems(prev => [...prev, ...items]);
    };
    reader.readAsArrayBuffer(info.file.originFileObj);
  } else if (info.file.status === "error") {
    message.error(`${info.file.name} حدث خطأ أثناء رفع الملف`);
  }
  };

  // ستايل مشابه لسند القبض
  const largeControlStyle = {
    height: 48,
    fontSize: 18,
    borderRadius: 8,
    padding: "8px 16px",
    boxShadow: "0 1px 6px rgba(0,0,0,0.07)",
    background: "#fff",
    border: "1.5px solid #d9d9d9",
    transition: "border-color 0.3s",
  };
  const labelStyle = { fontSize: 18, fontWeight: 500 };

  return (
    <div className="p-4 space-y-6 font-['Tajawal'] bg-gray-50 min-h-screen">
           <div className="p-3 sm:p-4 font-['Tajawal'] bg-white mb-4 rounded-lg shadow-[0_0_10px_rgba(0,0,0,0.1)] relative overflow-hidden">
        <div className="flex items-center">
          <FileTextOutlined className="h-5 w-5 sm:h-8 sm:w-8 text-emerald-600 ml-1 sm:ml-3" />
          <h1 className="text-lg sm:text-2xl font-bold text-gray-800">اضافة اذن صرف</h1>
        </div>
        <p className="text-xs sm:text-base text-gray-600 mt-2">إدارة وعرض أذونات الصرف</p>
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-green-500"></div>
      </div>
      <Breadcrumb
        items={[
          { label: "الرئيسية", to: "/" },
          { label: "إدارة المخازن", to: "/management/warehouse" },
          { label: "أذونات الصرف" , to: "/warehouses/list-warehouse" },
          { label: "اضافة اذن صرف   " }
        ]}
      />
      <div className="bg-white rounded-lg shadow-lg p-6 space-y-4">
        <div className="grid grid-cols-4 gap-6 mb-4">
          <div className="flex flex-col gap-2">
            <label style={labelStyle}>رقم القيد</label>
            <Input value={entryNumber} disabled placeholder="رقم القيد تلقائي" style={largeControlStyle} size="large" />
          </div>
          <div className="flex flex-col gap-2 ">
            <label style={labelStyle}>الفترة المحاسبية</label>
            <DatePicker.RangePicker
              value={periodRange}
              onChange={setPeriodRange}
              format="YYYY-MM-DD"
              placeholder={["من تاريخ", "إلى تاريخ"]}
              style={largeControlStyle}
              size="large"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label style={labelStyle}>رقم الإذن</label>
            <Input value={issueNumber} disabled placeholder="رقم الإذن تلقائي" style={largeControlStyle} size="large" />
          </div>
                    <div className="flex flex-col gap-2">
            <label style={labelStyle}>تاريخ الإذن</label>
            <DatePicker value={issueDate} onChange={setIssueDate} format="YYYY-MM-DD" placeholder="تاريخ الإذن" style={largeControlStyle} size="large" />
          </div>
        </div>
        <div className="grid grid-cols-4 gap-6 mb-4">
         
          <div className="flex flex-col gap-2">
            <label style={labelStyle}>رقم المرجع</label>
            <Input value={refNumber} onChange={e => setRefNumber(e.target.value)} placeholder="رقم المرجع" style={largeControlStyle} size="large" />
          </div>
          <div className="flex flex-col gap-2">
            <label style={labelStyle}>تاريخ المرجع</label>
            <DatePicker value={refDate} onChange={setRefDate} format="YYYY-MM-DD" placeholder="تاريخ المرجع" style={largeControlStyle} size="large" />
          </div>
          <div className="flex flex-col gap-2">
            <label style={labelStyle}>الفرع</label>
            <Select
              value={branch}
              onChange={setBranch}
              placeholder="اختر الفرع"
              allowClear
              style={largeControlStyle}
              size="large"
              showSearch
              optionFilterProp="children"
              className={`${styles.dropdown} ${styles.noAntBorder}`}
            >
              {branches.map(b => (
                <Select.Option key={b.id || b.code} value={b.id}>
                  {b.name}
                </Select.Option>
              ))}
            </Select>
          </div>
            <div className="flex flex-col gap-2">
            <label style={labelStyle}>المخزن</label>
            <Select
              value={warehouse}
              onChange={setWarehouse}
              placeholder="اختر المخزن"
              allowClear
              style={largeControlStyle}
              size="large"
              showSearch
              optionFilterProp="children"
              className={`${styles.dropdown} ${styles.noAntBorder}`}
            >
              {warehouses.map(w => (
                <Select.Option key={w.id} value={w.id}>
                  {w.nameAr || w.name || w.id}
                </Select.Option>
              ))}
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-6 mb-4">
          <div className="flex flex-col gap-2">
            <label style={labelStyle}>نوع الحركة</label>
            <Select value={movementType} onChange={setMovementType} placeholder="اختر نوع الحركة" allowClear style={largeControlStyle} size="large"
                          className={`${styles.dropdown} ${styles.noAntBorder}`}

            >
              <Select.Option value="صرف">صرف - Out</Select.Option>
              <Select.Option value="مردودات مشتريات">مردودات مشتريات - Returns purchases</Select.Option>
              <Select.Option value="سند تحويل">سند تحويل - Document transfer</Select.Option>
              <Select.Option value="تسوية عجز">تسوية عجز - Settlement</Select.Option>
              <Select.Option value="فاتورة مبيعات">فاتورة مبيعات - Sales invoice</Select.Option>
              <Select.Option value="أمر تصنيع">أمر تصنيع - Manufacturing order</Select.Option>
              <Select.Option value="أمر بيع">أمر بيع - Sales Order</Select.Option>
              <Select.Option value="إغلاق المخزون">إغلاق المخزون - Close Inventory</Select.Option>
              <Select.Option value="صرف من طلب مواد">صرف من طلب مواد - Out-Items_Request</Select.Option>
              <Select.Option value="صرف من طلب توريد">صرف من طلب توريد - Supply_Request</Select.Option>
              <Select.Option value="تسليم من مستند فك / فرز">تسليم من مستند فك / فرز</Select.Option>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <label style={labelStyle}>نوع الحساب</label>
            <Select value={accountType} onChange={setAccountType} placeholder="اختر نوع الحساب" allowClear style={largeControlStyle} size="large"
                          className={`${styles.dropdown} ${styles.noAntBorder}`}

            >
              <Select.Option value="مورد">مورد</Select.Option>
              <Select.Option value="عميل">عميل</Select.Option>
              className={`${styles.dropdown} ${styles.noAntBorder}`}
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <label style={labelStyle}>رقم الحساب</label>
            <div style={{ display: "flex", gap: 8 }}>
              <Input value={accountNumber} onChange={e => setAccountNumber(e.target.value)} placeholder="رقم الحساب" style={largeControlStyle} size="large"
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
                onClick={() => { setAccountModalType(accountType || "عميل"); setShowAccountModal(true); }}

                    >
                      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M4 4v6h6V4H4zm10 0v6h6V4h-6zM4 14v6h6v-6H4zm10 0v6h6v-6h-6z" stroke="#000" strokeWidth="2"/>
                      </svg>
                    </button>
                }
              />

            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label style={labelStyle}>اسم الحساب</label>
            <Input value={accountName} onChange={e => setAccountName(e.target.value)} placeholder="اسم الحساب" style={largeControlStyle} size="large"
            
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
                  onClick={() => { setAccountModalType(accountType || "عميل"); setShowAccountModal(true); }}

                                                >
                                                  <GiMagicBroom size={26} color="#0074D9" />
                                                </button>
                            }
            />
          </div>
      {/* مودال البحث عن الحساب */}
      <Modal
        open={showAccountModal}
        onCancel={() => setShowAccountModal(false)}
        footer={null}
        title={accountModalType === "عميل" ? "بحث عن عميل" : "بحث عن مورد"}
        width={600}
      >
        <Input
          placeholder="بحث بالاسم أو رقم الحساب..."
          value={accountSearch}
          onChange={e => setAccountSearch(e.target.value)}
          style={{ marginBottom: 12, fontSize: 17, borderRadius: 8, padding: '8px 12px' }}
          allowClear
          
        />
        {accountModalType === "عميل" ? (
          <Table
            dataSource={customerAccounts.filter(acc =>
              acc.code.includes(accountSearch) || acc.nameAr.includes(accountSearch) || (acc.mobile && acc.mobile.includes(accountSearch))
            )}
            columns={[
              { title: 'رقم الحساب', dataIndex: 'code', key: 'code', width: 120 },
              { title: 'اسم الحساب', dataIndex: 'nameAr', key: 'nameAr' },
              { title: 'جوال العميل', dataIndex: 'mobile', key: 'mobile', width: 140, render: (text: any) => text || '-' },
              { title: 'الرقم الضريبي', dataIndex: 'taxNumber', key: 'taxNumber', width: 160, render: (text: any) => text || '-' }
            ]}
            rowKey="code"
            pagination={{ pageSize: 8 }}
            size="small"
            bordered
            onRow={record => ({
              onClick: () => {
                setAccountNumber(record.code);
                setAccountName(record.nameAr);
                setShowAccountModal(false);
              },
              style: { cursor: 'pointer' }
            })}
          />
        ) : (
          <Table
            dataSource={supplierAccounts.filter(acc =>
              acc.code.includes(accountSearch) || acc.nameAr.includes(accountSearch) || (acc.mobile && acc.mobile.includes(accountSearch))
            )}
            columns={[
              { title: 'رقم الحساب', dataIndex: 'code', key: 'code', width: 120 },
              { title: 'اسم الحساب', dataIndex: 'nameAr', key: 'nameAr' },
              { title: 'جوال المورد', dataIndex: 'mobile', key: 'mobile', width: 140, render: (text: any) => text || '-' }
            ]}
            rowKey="code"
            pagination={{ pageSize: 8 }}
            size="small"
            bordered
            onRow={record => ({
              onClick: () => {
                setAccountNumber(record.code);
                setAccountName(record.nameAr);
                setShowAccountModal(false);
              },
              style: { cursor: 'pointer' }
            })}
          />
        )}
      </Modal>
        </div>
        <div className="grid grid-cols-4 gap-6 mb-4">
          <div className="flex flex-col gap-2">
            <label style={labelStyle}>نوع الجهة</label>
            <Select value={sideType} onChange={setSideType} placeholder="اختر نوع الجهة" allowClear style={largeControlStyle} size="large"
                          className={`${styles.dropdown} ${styles.noAntBorder}`}

            >
              <Select.Option value="موظف">موظف</Select.Option>
              <Select.Option value="إدارة/قسم">إدارة / قسم</Select.Option>
              <Select.Option value="مشروع">مشروع</Select.Option>
              <Select.Option value="موقع">موقع</Select.Option>
              <Select.Option value="جهة أخرى">جهة أخرى</Select.Option>
              className={`${styles.dropdown} ${styles.noAntBorder}`}
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <label style={labelStyle}>رقم الجهة</label>
            <Input value={sideNumber} onChange={e => setSideNumber(e.target.value)} placeholder="رقم الجهة" style={largeControlStyle} size="large" />
          </div>
          <div className="flex flex-col gap-2">
            <label style={labelStyle}>اسم الجهة</label>
            <Input value={sideName} onChange={e => setSideName(e.target.value)} placeholder="اسم الجهة" style={largeControlStyle} size="large" />
          </div>
                    <div className="flex flex-col gap-2">
            <label style={labelStyle}>تصنيف العملية</label>
            <Select value={operationClass} onChange={setOperationClass} placeholder="اختر التصنيف" allowClear style={largeControlStyle} size="large"
                          className={`${styles.dropdown} ${styles.noAntBorder}`}

            >
              <Select.Option value="إنشاء فاتورة">إنشاء فاتورة</Select.Option>
              className={`${styles.dropdown} ${styles.noAntBorder}`}

            </Select>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-6 mb-4">

          <div className="flex flex-col gap-2 col-span-3">
            <label style={labelStyle}>البيان</label>
            <Input.TextArea value={statement} onChange={e => setStatement(e.target.value)} placeholder="البيان" rows={2} style={{ ...largeControlStyle, minHeight: 48 }} />
          </div>
        </div>
      </div>
      {/* الأصناف */}
      <div className="bg-white rounded-lg shadow-lg p-6 space-y-4">
        <div className="flex items-center mb-4">
          <span className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold ml-3">ص</span>
          <h2 className="text-xl font-bold text-gray-800">الأصناف</h2>
        </div>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="صنف جديد" key="new">

            <div className="flex flex-row flex-wrap gap-4 items-end">
              <div className="flex flex-col gap-1">
                <label style={labelStyle}>رقم الصنف</label>
                <Input
                  value={itemCode}
                  onChange={e => setItemCode(e.target.value)}
                  placeholder="رقم الصنف"
                  style={{ ...largeControlStyle, width: 200 }}
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
                      onClick={() => setShowItemModal(true)}
                    >
                      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M4 4v6h6V4H4zm10 0v6h6V4h-6zM4 14v6h6v-6H4zm10 0v6h6v-6h-6z" stroke="#000" strokeWidth="2"/>
                      </svg>
                    </button>
                  }
                />
              </div>
              <div className="flex flex-col gap-1">
                <label style={labelStyle}>اسم الصنف</label>
                <Input
                  value={itemName}
                  onChange={e => setItemName(e.target.value)}
                  placeholder="اسم الصنف"
                  style={{ ...largeControlStyle, width: 200 }}
                  size="large"
                />
                {/* مودال البحث عن صنف */}
                <ItemSearchModal
                  open={showItemModal}
                  onClose={() => setShowItemModal(false)}
                  onSelect={item => {
                    setItemCode(item.code);
                    setItemName(item.nameAr || item.nameEn || "");
                    setUnit(item.unitName || "");
                    setPrice(item.price ? String(item.price) : "");
                  }}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label style={labelStyle}>الكمية</label>
                <Input type="number" min={1} value={quantity} onChange={e => setQuantity(e.target.value)} placeholder="الكمية" style={{...largeControlStyle, width: 90}} size="large" />
              </div>
              <div className="flex flex-col gap-1">
                <label style={labelStyle}>الوحدة</label>
                <Select
                  value={unit || "قطعة"}
                  onChange={setUnit}
                  placeholder="اختر الوحدة"
                  style={{ ...largeControlStyle, width: 150 }}
                  size="large"
                  defaultValue="قطعة"
                  className={`${styles.dropdown} ${styles.noAntBorder}`}
                >
                  <Select.Option value="قطعة">قطعة</Select.Option>
                  <Select.Option value="كرتون">كرتون</Select.Option>
                  <Select.Option value="كيلو">كيلو</Select.Option>
                  <Select.Option value="لتر">لتر</Select.Option>
                  <Select.Option value="متر">متر</Select.Option>
                  <Select.Option value="علبة">علبة</Select.Option>
                  <Select.Option value="رول">رول</Select.Option>
                  <Select.Option value="صندوق">صندوق</Select.Option>
                  <Select.Option value="عبوة">عبوة</Select.Option>
                  {/* أضف المزيد حسب الحاجة */}
                </Select>
              </div>
              <div className="flex flex-col gap-1">
                <label style={labelStyle}>السعر</label>
                <Input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="السعر" style={{...largeControlStyle, width: 110}} size="large" />
              </div>
              <div className="flex flex-col gap-1">
                <label style={labelStyle}> مركز التكلفة</label>
                <Input value={costCenterName} onChange={e => setCostCenterName(e.target.value)} placeholder="اسم مركز التكلفة" style={largeControlStyle} size="large" />
              </div>
              <Button type="primary" className="bg-blue-600" style={{ height: 48, fontSize: 18, borderRadius: 8, marginRight: 0 }} onClick={handleAddItem}>إضافة الصنف</Button>
            </div>

            {/* جدول الأصناف المضافة */}
            <div className="mt-8">
              <Table
                dataSource={addedItems}
                columns={itemColumns}
                rowKey={(record, idx) => idx}
                pagination={false}
                bordered
                locale={{ emptyText: 'لا توجد أصناف مضافة بعد' }}
              />
              <div className="flex gap-4 mt-4">
                <Button type="primary" onClick={handleSaveAndPrint}>حفظ</Button>
                <Button onClick={() => window.print()}>طباعة</Button>
              </div>
            </div>
          </TabPane>
          <TabPane tab="استيراد من ملف إكسل" key="excel">
            <div className="flex flex-col gap-4 items-start">
              <label style={labelStyle}>رفع ملف إكسل</label>
              <Upload 
                name="excel"
                accept=".xlsx,.xls"
                showUploadList={false}
                customRequest={({ file, onSuccess }) => {
                  setTimeout(() => {
                    onSuccess("ok");
                  }, 1000);
                }}
                onChange={handleExcelUpload}
              >
                <Button icon={<UploadOutlined />} style={largeControlStyle} size="large">اختر ملف إكسل</Button>
              </Upload>
              <div style={{marginTop: 8, color: '#d97706', fontSize: 16, fontWeight: 500, background: '#fffbe6', borderRadius: 6, padding: '8px 12px', border: '1px solid #ffe58f', display: 'flex', alignItems: 'center', gap: 8}}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" style={{flexShrink:0}} xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" stroke="#d97706" strokeWidth="2" fill="#fffbe6"/><path d="M12 8v4" stroke="#d97706" strokeWidth="2" strokeLinecap="round"/><circle cx="12" cy="16" r="1" fill="#d97706"/></svg>
                يجب أن يحتوي ملف الإكسل على الأعمدة التالية بالترتيب: رقم كود الصنف، اسم الصنف، الكمية، الوحدة، السعر، مركز التكلفة
              </div>
              {excelFile && <span className="text-green-600">تم رفع الملف: {excelFile.name}</span>}
            </div>

            {/* جدول الأصناف المضافة */}
            <div className="mt-8">
              <Table
                dataSource={addedItems}
                columns={itemColumns}
                rowKey={(record, idx) => idx}
                pagination={false}
                bordered
                locale={{ emptyText: 'لا توجد أصناف مضافة بعد' }}
              />
              <div className="flex gap-4 mt-4">
                <Button type="primary" onClick={handleSaveAndPrint}>حفظ</Button>
                <Button onClick={() => window.print()}>طباعة</Button>
              </div>
            </div>
          </TabPane>
        </Tabs>
      </div>
    </div>
  );
};

export default IssueWarehousePage;
