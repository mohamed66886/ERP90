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

const AddSpecialPricePackage = () => {
  // تحديد الأصناف في مودال أصناف الفئة
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  // دالة تعديل بيانات صف في جدول الأصناف
  const handleCategoryItemEdit = (idx: number, field: string, value: any) => {
    setCategoryItems(items => items.map((item, i) => i === idx ? { ...item, [field]: value } : item));
  };
  // حالة مودال اختيار الفئة
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showItemsModal, setShowItemsModal] = useState(false);
  const [categoryItems, setCategoryItems] = useState([]);
  // الأصناف والفئات من صفحة الأصناف
  const [allItems, setAllItems] = useState([]);
  const [categories, setCategories] = useState([]);

  // جلب الأصناف والفئات من قاعدة البيانات
  useEffect(() => {
    (async () => {
      try {
        const { db } = await import("@/lib/firebase");
        const { getDocs, collection } = await import("firebase/firestore");
        const snapshot = await getDocs(collection(db, "inventory_items"));
        const itemsList = snapshot.docs.map(doc => doc.data());
        setAllItems(itemsList);
        // استخراج الفئات الفريدة من الأدب الصنف
        const uniqueCategories = Array.from(new Set(itemsList.map(item => item.type)));
        setCategories(uniqueCategories);
      } catch (e) {
        // يمكن إضافة رسالة خطأ هنا
      }
    })();
  }, []);
  // حالة الأصناف المadded
  const [addedItems, setAddedItems] = useState<Array<{ itemCode: string; itemName: string; unit: string; unitPrice: string; maxPrice: string; minPrice: string }>>([]);

  // كود الباقة التلقائي
  const [packageCode, setPackageCode] = useState("");
  const [packageSeq, setPackageSeq] = useState(1);
  useEffect(() => {
    // توليد كود تلقائي (مثال: PKG-YYYY-0001)
    const year = dayjs().format('YYYY');
    setPackageCode(`PKG-${year}-${String(packageSeq).padStart(4, '0')}`);
  }, [packageSeq]);

  // عند حفظ الباقة، زيادة الترتيب
  const incrementPackageSeq = () => {
    setPackageSeq(seq => seq + 1);
  };

  // أعمدة جدول باقة الأسعار
  const itemColumns = [
    { title: 'رقم الصنف', dataIndex: 'itemCode', key: 'itemCode', width: 100 },
    { title: 'اسم الصنف', dataIndex: 'itemName', key: 'itemName', width: 150 },
    { title: 'الوحدة', dataIndex: 'unit', key: 'unit', width: 80 },
    { title: 'سعر الوحدة', dataIndex: 'unitPrice', key: 'unitPrice', width: 100 },
    { title: 'أعلى سعر', dataIndex: 'maxPrice', key: 'maxPrice', width: 100 },
    { title: 'أقل سعر', dataIndex: 'minPrice', key: 'minPrice', width: 100 },
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
      !unitPrice || Number(unitPrice) <= 0 ||
      !maxPrice || Number(maxPrice) <= 0 ||
      !minPrice || Number(minPrice) <= 0
    ) {
      return message.error('يرجى إدخال جميع بيانات الصنف بشكل صحيح');
    }
    setAddedItems(items => [...items, { itemCode, itemName, unit: finalUnit, unitPrice, maxPrice, minPrice }]);
    setItemCode('');
    setItemName('');
    setUnit('');
    setUnitPrice('');
    setMaxPrice('');
    setMinPrice('');
  };

  // حفظ باقة الأسعار
  const [packageNameAr, setPackageNameAr] = useState("");
  const [packageNameEn, setPackageNameEn] = useState("");
  // تاريخ البدء
  const [startDate, setStartDate] = useState(dayjs());
  // تاريخ الانتهاء
  const [endDate, setEndDate] = useState(null);
  const [company, setCompany] = useState("");
  const [branchesSelected, setBranchesSelected] = useState<string[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  // جلب الشركات من Firestore
  const [companies, setCompanies] = useState<{ id: string; arabicName: string; englishName?: string }[]>([]);

  useEffect(() => {
    // جلب الشركات من قاعدة البيانات
    const fetchCompanies = async () => {
      try {
        // استيراد db و getDocs و collection من firebase
        const { db } = await import("@/lib/firebase");
        const { getDocs, collection } = await import("firebase/firestore");
        const snapshot = await getDocs(collection(db, "companies"));
        const companiesList = snapshot.docs.map(doc => ({
          id: doc.id,
          arabicName: doc.data().arabicName || "",
          englishName: doc.data().englishName || ""
        }));
        setCompanies(companiesList);
      } catch (e) {
        // يمكن إضافة رسالة خطأ هنا
      }
    };
    fetchCompanies();
  }, []);

  // جلب الفروع عند اختيار الشركة
  useEffect(() => {
    if (!company) {
      setBranches([]);
      setBranchesSelected([]);
      return;
    }
    fetchBranches().then((allBranches: Branch[]) => {
      setBranches(allBranches);
    }).catch(() => setBranches([]));
  }, [company]);
  const handleSavePackage = () => {
    if (!packageNameAr.trim()) return message.error('يرجى إدخال اسم الباقة بالعربي');
    if (!packageNameEn.trim()) return message.error('يرجى إدخال اسم الباقة بالإنجليزي');
    if (!company.trim()) return message.error('يرجى اختيار الشركة');
    if (!branchesSelected.length) return message.error('يرجى اختيار الفروع');
    if (!addedItems.length) return message.error('يرجى إضافة الأصناف للباقة');
    const saveData = {
      packageCode,
      packageNameAr,
      packageNameEn,
      startDate: startDate ? startDate.format('YYYY-MM-DD') : null,
      endDate: endDate ? endDate.format('YYYY-MM-DD') : null,
      company,
      branches: branchesSelected,
      items: addedItems
    };
    // حفظ البيانات في فايربيز
    (async () => {
      try {
        const { db } = await import("@/lib/firebase");
        const { collection, addDoc } = await import("firebase/firestore");
        await addDoc(collection(db, "specialPricePackages"), saveData);
        message.success('تم حفظ باقة الأسعار بنجاح ');
        setAddedItems([]);
        setPackageNameAr("");
        setPackageNameEn("");
        setStartDate(dayjs());
        setEndDate(null);
        setCompany("");
        setBranchesSelected([]);
        incrementPackageSeq();
      } catch (e) {
        message.error('حدث خطأ أثناء حفظ البيانات ');
      }
    })();
  };
  // نموذج باقة الأسعار
  const [activeTab, setActiveTab] = useState("new");
  const [itemCode, setItemCode] = useState("");
  const [itemName, setItemName] = useState("");
  // تم حذف الكمية
  const [unit, setUnit] = useState("");
  const [unitPrice, setUnitPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [costCenterName, setCostCenterName] = useState("");
  const [showItemModal, setShowItemModal] = useState(false);
  const [excelFile, setExcelFile] = useState(null);
  const [categorySearch, setCategorySearch] = useState("");
  const [categoryItemsPage, setCategoryItemsPage] = useState(1);
  const [categoryItemsPageSize, setCategoryItemsPageSize] = useState(10);
  const [categoryItemsSearch, setCategoryItemsSearch] = useState("");
  const categoryItemsFiltered = categoryItems.filter(item => {
    const name = item.nameAr || item.nameEn || item.itemName || item.name || '';
    const code = item.itemCode || '';
    return name.toLowerCase().includes(categoryItemsSearch.toLowerCase()) || code.toLowerCase().includes(categoryItemsSearch.toLowerCase());
  });

  // استيراد من ملف إكسل
  const handleExcelUpload = (info: any) => {
    const file = info.file;
    if (file.status === "done") {
      message.success(`${file.name} تم رفع الملف بنجاح`);
      setExcelFile(file.originFileObj);
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
            unit: String(row[2] || "قطعة"),
            unitPrice: String(row[3] || ""),
            maxPrice: String(row[4] || ""),
            minPrice: String(row[5] || "")
          }))
          .filter(item => item.itemCode && item.itemName && item.unit);
        if (!items.length) {
          message.error("لم يتم العثور على أصناف صالحة في الملف");
          return;
        }
        setAddedItems(prev => [...prev, ...items]);
      };
      reader.readAsArrayBuffer(file.originFileObj);
    } else if (file.status === "error") {
      message.error(`${file.name} حدث خطأ أثناء رفع الملف`);
    }
  };

  // ستايل عناصر النموذج
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
          <h1 className="text-lg sm:text-2xl font-bold text-gray-800">إضافة باقة سعر خاص</h1>
        </div>
        <p className="text-xs sm:text-base text-gray-600 mt-2">إدارة وعرض باقات الأسعار الخاصة</p>
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-green-500"></div>
      </div>
      <Breadcrumb
        items={[
          { label: "الرئيسية", to: "/" },
          { label: "إدارة المبيعات", to: "/management/sales" },
          { label: "باقات السعر " , to: "/management/special-price-packages" },
          { label: "إضافة باقة سعر خاص" }
        ]}
      />
      <div className="bg-white rounded-lg shadow-lg p-6 space-y-4">
      <div className="grid grid-cols-5 gap-6 mb-4">
        <div className="flex flex-col gap-2">
          <label style={labelStyle}>كود الباقة</label>
          <Input value={packageCode} disabled style={largeControlStyle} size="large" />
        </div>
        <div className="flex flex-col gap-2">
          <label style={labelStyle}>اسم الباقة (عربي)</label>
          <Input value={packageNameAr} onChange={e => setPackageNameAr(e.target.value)} placeholder="اسم الباقة بالعربي" style={largeControlStyle} size="large" />
        </div>
        <div className="flex flex-col gap-2">
          <label style={labelStyle}>اسم الباقة (إنجليزي)</label>
          <Input value={packageNameEn} onChange={e => setPackageNameEn(e.target.value)} placeholder="اسم الباقة بالإنجليزي" style={largeControlStyle} size="large" />
        </div>
        <div className="flex flex-col gap-2">
          <label style={labelStyle}>تاريخ البدء</label>
          <DatePicker value={startDate} onChange={setStartDate} format="YYYY-MM-DD" placeholder="تاريخ البدء" style={largeControlStyle} size="large" />
        </div>
        <div className="flex flex-col gap-2">
          <label style={labelStyle}>تاريخ الانتهاء</label>
          <DatePicker value={endDate} onChange={setEndDate} format="YYYY-MM-DD" placeholder="تاريخ الانتهاء" style={largeControlStyle} size="large" />
        </div>
        <div className="flex flex-col gap-2">
          <label style={labelStyle}>الشركة</label>
          <Select
            value={company}
            onChange={setCompany}
            placeholder="اختر الشركة"
            style={largeControlStyle}
            size="large"
            showSearch
            optionFilterProp="children"
            allowClear
            className={styles.dropdown}
          >
            {companies.map((c) => (
              <Select.Option key={c.id} value={c.id}>
                {c.arabicName || c.englishName || c.id}
              </Select.Option>
            ))}
          </Select>
        </div>
        <div className="flex flex-col gap-2">
          <label style={labelStyle}>الفروع</label>
          <Select
            mode="multiple"
            value={branchesSelected}
            onChange={setBranchesSelected}
            placeholder={branchesSelected.length ? `تم اختيار ${branchesSelected.length} فرع${branchesSelected.length > 1 ? 'اً' : ''}` : "اختر الفروع"}
            style={largeControlStyle}
            size="large"
            optionFilterProp="children"
            allowClear
            disabled={!company}
            dropdownRender={menu => (
              <>
                <div style={{ padding: '8px', borderBottom: '1px solid #eee', display: 'flex', gap: 12 }}>
                  <Button
                    type="link"
                    style={{ padding: 0, fontWeight: 600 }}
                    onClick={e => {
                      e.preventDefault();
                      setBranchesSelected(branches.map(b => b.id || b.code));
                    }}
                  >تحديد الكل</Button>
                  <Button
                    type="link"
                    style={{ padding: 0, fontWeight: 600, color: '#e53e3e' }}
                    onClick={e => {
                      e.preventDefault();
                      setBranchesSelected([]);
                    }}
                  >إلغاء التحديد</Button>
                </div>
                {menu}
              </>
            )}
            tagRender={({ value, closable, onClose }) => null}
            className={styles.dropdown}
          >
            {branches.map(b => (
              <Select.Option key={b.id || b.code} value={b.id || b.code}>
                <input
                  type="checkbox"
                  checked={branchesSelected.includes(b.id || b.code)}
                  readOnly
                  style={{ marginLeft: 8 }}
                />
                {b.name}
              </Select.Option>
            ))}
          </Select>
        </div>
      </div>
      </div>
      {/* الأصناف */}
      <div className="bg-white rounded-lg shadow-lg p-6 space-y-4">
        <div className="flex items-center mb-4">
          <span className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold ml-3">ص</span>
          <h2 className="text-xl font-bold text-gray-800">الأصناف في الباقة</h2>
        </div>
        <Tabs activeKey={activeTab} onChange={setActiveTab} style={{ marginRight: 24 }}>
          <TabPane tab="إضافة صنف" key="new">
            <div className="grid grid-cols-1 md:grid-cols-7 gap-4 items-end w-full">
              <div className="flex flex-col gap-1 w-full">
                <label style={labelStyle}>رقم الصنف</label>
                <Input
                  value={itemCode}
                  onChange={e => setItemCode(e.target.value)}
                  placeholder="رقم الصنف"
                  style={{ ...largeControlStyle, width: '100%' }}
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
              <div className="flex flex-col gap-1 w-full">
                <label style={labelStyle}>اسم الصنف</label>
                <Input
                  value={itemName}
                  onChange={e => setItemName(e.target.value)}
                  placeholder="اسم الصنف"
                  style={{ ...largeControlStyle, width: '100%' }}
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
                  }}
                />
              </div>
              <div className="flex flex-col gap-1 w-full">
                <label style={labelStyle}>الوحدة</label>
                <Select
                  value={unit || "قطعة"}
                  onChange={setUnit}
                  placeholder="اختر الوحدة"
                  style={{ ...largeControlStyle, width: '100%' }}
                  size="large"
                  defaultValue="قطعة"
                  className={styles.dropdown}
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
              <div className="flex flex-col gap-1 w-full">
                <label style={labelStyle}>سعر الوحدة</label>
                <Input type="number" value={unitPrice} onChange={e => setUnitPrice(e.target.value)} placeholder="سعر الوحدة" style={{...largeControlStyle, width: '100%'}} size="large" />
              </div>
              <div className="flex flex-col gap-1 w-full">
                <label style={labelStyle}>أعلى سعر</label>
                <Input type="number" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} placeholder="أعلى سعر" style={{...largeControlStyle, width: '100%'}} size="large" />
              </div>
              <div className="flex flex-col gap-1 w-full">
                <label style={labelStyle}>أقل سعر</label>
                <Input type="number" value={minPrice} onChange={e => setMinPrice(e.target.value)} placeholder="أقل سعر" style={{...largeControlStyle, width: '100%'}} size="large" />
              </div>
              <div className="flex flex-col gap-1 w-full">
                <label style={{ visibility: 'hidden' }}>إضافة</label>
                <Button type="primary" className="bg-blue-600 w-full" style={{ height: 48, fontSize: 18, borderRadius: 8 }} onClick={handleAddItem}>إضافة الصنف</Button>
              </div>
            </div>
            {/* جدول الأصناف المadded */}
            <div className="mt-8">
              <Table
                dataSource={addedItems}
                columns={itemColumns}
                rowKey={(record, idx) => idx}
                pagination={false}
                bordered
                locale={{ emptyText: 'لا توجد أصناف مaddedة بعد' }}
              />
              <div className="flex gap-4 mt-4">
                <Button type="primary" onClick={handleSavePackage}>حفظ الباقة</Button>
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
                يجب أن يحتوي ملف الإكسل على الأعمدة التالية بالترتيب: رقم الصنف، اسم الصنف، الوحدة، سعر الوحدة، أعلى سعر، أقل سعر
              </div>
              {excelFile && <span className="text-green-600">تم رفع الملف: {excelFile.name}</span>}
            </div>
            {/* جدول الأصناف المadded */}
            <div className="mt-8">
              <Table
                dataSource={addedItems}
                columns={itemColumns}
                rowKey={(record, idx) => idx}
                pagination={false}
                bordered
                locale={{ emptyText: 'لا توجد أصناف مaddedة بعد' }}
              />
              <div className="flex gap-4 mt-4">
                <Button type="primary" onClick={handleSavePackage}>حفظ الباقة</Button>
                <Button onClick={() => window.print()}>طباعة</Button>
              </div>
            </div>
          </TabPane>
          <TabPane tab="استيراد من مجموعة" key="import-items">
            <div className="flex gap-4 mb-4">
              <Button type="primary" onClick={() => setShowCategoryModal(true)}>استيراد</Button>
            </div>
            {/* مودال اختيار الفئة */}
            <Modal
              open={showCategoryModal}
              onCancel={() => setShowCategoryModal(false)}
              footer={null}
              title="اختر الفئة"
            >
              <div>
                <Input
                  placeholder="ابحث باسم الفئة..."
                  style={{ marginBottom: 12 }}
                  onChange={e => setCategorySearch(e.target.value)}
                />
                <Table
                  dataSource={allItems.filter(item => item.type === 'مستوى أول' && (!categorySearch || item.name.toLowerCase().includes(categorySearch.toLowerCase())))}
                  columns={[{
                    title: 'اسم الفئة',
                    dataIndex: 'name',
                    key: 'name',
                  }, {
                    title: 'رقم الفئة',
                    dataIndex: 'id',
                    key: 'id',
                  }, {
                    title: 'إجراءات',
                    key: 'actions',
                    render: (_: any, record: any) => (
                      <Button type="primary" onClick={() => {
                        setSelectedCategory(record.name);
                        const itemsInCat = allItems.filter(i => i.type === 'مستوى ثاني' && i.parentId === record.id);
                        setCategoryItems(itemsInCat);
                        setShowCategoryModal(false);
                        setShowItemsModal(true);
                      }}>عرض الأصناف</Button>
                    )
                  }]}
                  rowKey={record => record.id}
                  pagination={false}
                  locale={{ emptyText: 'لا توجد فئات مطابقة' }}
                />
              </div>
            </Modal>
            {/* مودال عرض أصناف الفئة */}
            <Modal
              open={showItemsModal}
              onCancel={() => setShowItemsModal(false)}
              footer={null}
              title={selectedCategory ? `أصناف الفئة: ${selectedCategory}` : "أصناف الفئة"}
              width={900}
            >
              <div className="mb-3 flex gap-3 items-center">
                <Input
                  placeholder="ابحث باسم أو رقم الصنف..."
                  style={{ width: 220 }}
                  value={categoryItemsSearch}
                  onChange={e => {
                    setCategoryItemsSearch(e.target.value);
                    setCategoryItemsPage(1);
                  }}
                />
                <Button type="primary" onClick={() => {
                  setSelectedRows(categoryItemsFiltered.map((_, idx) => idx));
                }}>تحديد الكل</Button>
                <Button onClick={() => setSelectedRows([])}>إلغاء التحديد</Button>
              </div>
              <Table
                dataSource={categoryItemsFiltered.slice((categoryItemsPage-1)*categoryItemsPageSize, categoryItemsPage*categoryItemsPageSize).map((item, idx) => ({ ...item, _idx: ((categoryItemsPage-1)*categoryItemsPageSize)+idx }))}
                columns={[{
                  title: '',
                  dataIndex: '_idx',
                  key: 'select',
                  width: 40,
                  render: (_: unknown, record: { _idx: number }) => (
                    <input type="checkbox" checked={selectedRows.includes(record._idx)} onChange={e => {
                      if (e.target.checked) {
                        setSelectedRows(prev => [...prev, record._idx]);
                      } else {
                        setSelectedRows(prev => prev.filter(i => i !== record._idx));
                      }
                    }} />
                  )
                },
                {
                  title: 'رقم الصنف',
                  dataIndex: 'itemCode',
                  key: 'itemCode',
                },
                {
                  title: 'اسم الصنف',
                  dataIndex: 'itemName',
                  key: 'itemName',
                  render: (_: string, record: any) => (
                    record.nameAr || record.nameEn || record.itemName || record.name || ''
                  )
                },
                {
                  title: 'الوحدة',
                  dataIndex: 'unit',
                  key: 'unit',
                  render: (val: string, record: { _idx: number }) => (
                    <Select
                      value={val || 'قطعة'}
                      style={{ width: 90 }}
                      onChange={v => handleCategoryItemEdit(record._idx, 'unit', v)}
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
                    </Select>
                  )
                },
                {
                  title: 'سعر الوحدة',
                  dataIndex: 'unitPrice',
                  key: 'unitPrice',
                  render: (val: string, record: { _idx: number }) => (
                    <Input type="number" value={val || ''} style={{ width: 90 }} onChange={e => handleCategoryItemEdit(record._idx, 'unitPrice', e.target.value)} />
                  )
                },
                {
                  title: 'أعلى سعر',
                  dataIndex: 'maxPrice',
                  key: 'maxPrice',
                  render: (val: string, record: { _idx: number }) => (
                    <Input type="number" value={val || ''} style={{ width: 90 }} onChange={e => handleCategoryItemEdit(record._idx, 'maxPrice', e.target.value)} />
                  )
                },
                {
                  title: 'أقل سعر',
                  dataIndex: 'minPrice',
                  key: 'minPrice',
                  render: (val: string, record: { _idx: number }) => (
                    <Input type="number" value={val || ''} style={{ width: 90 }} onChange={e => handleCategoryItemEdit(record._idx, 'minPrice', e.target.value)} />
                  )
                }
                ]}
                rowKey={record => record._idx}
                pagination={false}
                bordered
                locale={{ emptyText: 'لا توجد أصناف في هذه الفئة' }}
              />
              <div className="flex justify-center mt-4">
                <Button disabled={categoryItemsPage === 1} onClick={() => setCategoryItemsPage(p => p-1)}>السابق</Button>
                <span style={{margin: '0 16px'}}>صفحة {categoryItemsPage} من {Math.ceil(categoryItemsFiltered.length/categoryItemsPageSize)}</span>
                <Button disabled={categoryItemsPage >= Math.ceil(categoryItemsFiltered.length/categoryItemsPageSize)} onClick={() => setCategoryItemsPage(p => p+1)}>التالي</Button>
              </div>
              <div className="flex gap-4 mt-4">
                <Button type="primary" onClick={() => {
                  // إضافة الأصناف المحددة للباقة
                  const selected = selectedRows.map(idx => {
                    const item = categoryItems[idx];
                    return {
                      itemCode: item.itemCode || '',
                      itemName: item.nameAr || item.nameEn || item.itemName || item.name || '',
                      unit: item.unit || 'قطعة',
                      unitPrice: item.unitPrice || '',
                      maxPrice: item.maxPrice || '',
                      minPrice: item.minPrice || ''
                    };
                  });
                  setAddedItems(prev => [...prev, ...selected]);
                  setShowItemsModal(false);
                  message.success('تم إضافة الأصناف المحددة للباقة');
                }}>استيراد الأصناف المحددة</Button>
                <Button onClick={() => setShowItemsModal(false)}>إغلاق</Button>
              </div>
            </Modal>
            <Table
              dataSource={addedItems}
              columns={itemColumns}
              rowKey={(record, idx) => idx}
              pagination={false}
              bordered
              locale={{ emptyText: 'لا توجد أصناف مaddedة بعد' }}
            />
          </TabPane>
        </Tabs>
      </div>
    </div>
  );
};

export default AddSpecialPricePackage;

