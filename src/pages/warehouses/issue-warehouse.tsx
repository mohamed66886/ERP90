import React, { useState } from "react";
import { Button, Input, Select, DatePicker, Tabs, Upload, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";

const { TabPane } = Tabs;

const IssueWarehousePage = () => {
  // بيانات إذن الصرف
  const [entryNumber, setEntryNumber] = useState("");
  const [periodRange, setPeriodRange] = useState([null, null]);
  const [issueNumber, setIssueNumber] = useState("");
  const [issueDate, setIssueDate] = useState(null);
  const [refNumber, setRefNumber] = useState("");
  const [refDate, setRefDate] = useState(null);
  const [branch, setBranch] = useState(null);
  const [warehouse, setWarehouse] = useState(null);
  const [movementType, setMovementType] = useState(null);
  const [accountType, setAccountType] = useState(null);
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
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
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("");
  const [price, setPrice] = useState("");
  const [costCenterNumber, setCostCenterNumber] = useState("");
  const [costCenterName, setCostCenterName] = useState("");
  const [additionWeight, setAdditionWeight] = useState("");

  // استيراد من ملف إكسل
  const [excelFile, setExcelFile] = useState(null);

  const handleExcelUpload = (info: any) => {
    if (info.file.status === "done") {
      message.success(`${info.file.name} تم رفع الملف بنجاح`);
      setExcelFile(info.file.originFileObj);
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
      {/* بيانات إذن الصرف */}
      <div className="p-4 font-['Tajawal'] bg-white mb-4 rounded-lg shadow-[0_0_10px_rgba(0,0,0,0.1)] relative overflow-hidden">
        <div className="flex items-center">
          <span className="h-8 w-8 bg-orange-600 rounded-full flex items-center justify-center text-white font-bold ml-3">إ</span>
          <h1 className="text-2xl font-bold text-gray-800">إضافة إذن صرف</h1>
        </div>
        <p className="text-gray-600 mt-2">بيانات إذن الصرف</p>
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-orange-400 to-purple-500"></div>
      </div>
      <div className="bg-white rounded-lg shadow-lg p-6 space-y-4">
        <div className="grid grid-cols-4 gap-6 mb-4">
          <div className="flex flex-col gap-2">
            <label style={labelStyle}>رقم القيد</label>
            <Input value={entryNumber} onChange={e => setEntryNumber(e.target.value)} placeholder="رقم القيد" style={largeControlStyle} size="large" />
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
            <Input value={issueNumber} onChange={e => setIssueNumber(e.target.value)} placeholder="رقم الإذن" style={largeControlStyle} size="large" />
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
            <Select value={branch} onChange={setBranch} placeholder="اختر الفرع" allowClear style={largeControlStyle} size="large">
              <Select.Option value="branch1">فرع 1</Select.Option>
              <Select.Option value="branch2">فرع 2</Select.Option>
            </Select>
          </div>
            <div className="flex flex-col gap-2">
            <label style={labelStyle}>المخزن</label>
            <Select value={warehouse} onChange={setWarehouse} placeholder="اختر المخزن" allowClear style={largeControlStyle} size="large">
              <Select.Option value="warehouse1">مخزن 1</Select.Option>
              <Select.Option value="warehouse2">مخزن 2</Select.Option>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-6 mb-4">
          <div className="flex flex-col gap-2">
            <label style={labelStyle}>نوع الحركة</label>
            <Select value={movementType} onChange={setMovementType} placeholder="اختر نوع الحركة" allowClear style={largeControlStyle} size="large">
              <Select.Option value="صرف">صرف</Select.Option>
              <Select.Option value="تحويل">تحويل</Select.Option>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <label style={labelStyle}>نوع الحساب</label>
            <Select value={accountType} onChange={setAccountType} placeholder="اختر نوع الحساب" allowClear style={largeControlStyle} size="large">
              <Select.Option value="مورد">مورد</Select.Option>
              <Select.Option value="عميل">عميل</Select.Option>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <label style={labelStyle}>رقم الحساب</label>
            <Input value={accountNumber} onChange={e => setAccountNumber(e.target.value)} placeholder="رقم الحساب" style={largeControlStyle} size="large" />
          </div>
            <div className="flex flex-col gap-2">
                <label style={labelStyle}>اسم الحساب</label>
                <Input value={accountName} onChange={e => setAccountName(e.target.value)} placeholder="اسم الحساب" style={largeControlStyle} size="large" />
              </div>
        </div>
        <div className="grid grid-cols-4 gap-6 mb-4">
          <div className="flex flex-col gap-2">
            <label style={labelStyle}>نوع الجهة</label>
            <Select value={sideType} onChange={setSideType} placeholder="اختر نوع الجهة" allowClear style={largeControlStyle} size="large">
              <Select.Option value="جهة حكومية">جهة حكومية</Select.Option>
              <Select.Option value="جهة خاصة">جهة خاصة</Select.Option>
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
            <Select value={operationClass} onChange={setOperationClass} placeholder="اختر التصنيف" allowClear style={largeControlStyle} size="large">
              <Select.Option value="تصنيف 1">تصنيف 1</Select.Option>
              <Select.Option value="تصنيف 2">تصنيف 2</Select.Option>
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
            <div className="flex gap-6 mb-4 flex-wrap items-end">
              <div className="flex flex-col gap-2">
                <label style={labelStyle}>رقم الصنف</label>
                <Input value={itemCode} onChange={e => setItemCode(e.target.value)} placeholder="رقم الصنف" style={largeControlStyle} size="large" />
              </div>
              <div className="flex flex-col gap-2">
                <label style={labelStyle}>اسم الصنف</label>
                <Input value={itemName} onChange={e => setItemName(e.target.value)} placeholder="اسم الصنف" style={largeControlStyle} size="large" />
              </div>
              <div className="flex flex-col gap-2">
                <label style={labelStyle}>الكمية</label>
                <Input value={quantity} onChange={e => setQuantity(e.target.value)} placeholder="الكمية" style={largeControlStyle} size="large" />
              </div>
              <div className="flex flex-col gap-2">
                <label style={labelStyle}>الوحدة</label>
                <Input value={unit} onChange={e => setUnit(e.target.value)} placeholder="الوحدة" style={largeControlStyle} size="large" />
              </div>
              <div className="flex flex-col gap-2">
                <label style={labelStyle}>السعر</label>
                <Input value={price} onChange={e => setPrice(e.target.value)} placeholder="السعر" style={largeControlStyle} size="large" />
              </div>
              <div className="flex flex-col gap-2">
                <label style={labelStyle}>رقم مركز التكلفة</label>
                <Input value={costCenterNumber} onChange={e => setCostCenterNumber(e.target.value)} placeholder="رقم مركز التكلفة" style={largeControlStyle} size="large" />
              </div>
              <div className="flex flex-col gap-2">
                <label style={labelStyle}>اسم مركز التكلفة</label>
                <Input value={costCenterName} onChange={e => setCostCenterName(e.target.value)} placeholder="اسم مركز التكلفة" style={largeControlStyle} size="large" />
              </div>
              <Button type="primary" className="bg-blue-600" style={{ height: 48, fontSize: 18, borderRadius: 8, marginRight: 0 }}>إضافة الصنف</Button>
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
              {excelFile && <span className="text-green-600">تم رفع الملف: {excelFile.name}</span>}
            </div>
          </TabPane>
        </Tabs>
      </div>
    </div>
  );
};

export default IssueWarehousePage;
