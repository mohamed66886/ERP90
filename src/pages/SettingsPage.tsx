import React, { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { getDocs, query, collection, doc, setDoc } from "firebase/firestore";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const initialData = {
  arabicName: "",
  englishName: "",
  logoUrl: "",
  commercialRegistration: "",
  taxFile: "",
  registrationDate: "",
  issuingAuthority: "",
  companyType: "",
  activityType: "",
  nationality: "",
  city: "",
  region: "",
  street: "",
  district: "",
  buildingNumber: "",
  postalCode: "",
  countryCode: "SA",
  phone: "",
  mobile: "",
  fiscalYear: "",
  taxRate: ""
};

const SettingsPage = () => {
  const [formData, setFormData] = useState(initialData);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [companyId, setCompanyId] = useState("");

  useEffect(() => {
    const fetchCompany = async () => {
      setLoading(true);
      try {
        const q = query(collection(db, "companies"));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          const docData = snapshot.docs[0];
          setFormData({ ...initialData, ...docData.data() });
          setCompanyId(docData.id);
        }
      } catch (e) {
        toast.error("حدث خطأ أثناء جلب بيانات الشركة");
        console.error("Error fetching company: ", e);
      }
      setLoading(false);
    };
    fetchCompany();
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      if (!companyId) {
        toast.error("لا يوجد معرف شركة");
        return;
      }
      
      await setDoc(doc(db, "companies", companyId), formData);
      setEditMode(false);
      toast.success("تم تحديث بيانات الشركة بنجاح");
    } catch (e) {
      toast.error("حدث خطأ أثناء حفظ التعديلات");
      console.error("Error saving company data: ", e);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-lg font-arabic">جاري تحميل بيانات الشركة...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-0 py-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 font-arabic">إعدادات الشركة</h1>
          {!editMode && (
            <button 
              onClick={() => setEditMode(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-arabic text-sm"
            >
              تعديل البيانات
            </button>
          )}
        </div>

        <form className="space-y-6" onSubmit={e => { e.preventDefault(); handleSave(); }}>
          {/* Basic Info Section */}
          <div className="border-b border-gray-200 pb-6">
            <h2 className="text-lg font-medium text-gray-800 mb-4 font-arabic">المعلومات الأساسية</h2>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 font-arabic">الاسم بالعربي *</label>
                <input 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-arabic"
                  value={formData.arabicName} 
                  disabled={!editMode} 
                  onChange={e => handleInputChange("arabicName", e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 font-arabic">الاسم بالإنجليزي</label>
                <input 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.englishName} 
                  disabled={!editMode} 
                  onChange={e => handleInputChange("englishName", e.target.value)}
                />
              </div>
              {/* حقل رابط لوجو الشركة */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 font-arabic">رابط لوجو الشركة</label>
                <input
                  type="url"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.logoUrl || ""}
                  disabled={!editMode}
                  onChange={e => handleInputChange("logoUrl", e.target.value)}
                  placeholder="https://example.com/logo.png"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 font-arabic">السنة المالية</label>
                  <input
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-arabic"
                    value={formData.fiscalYear}
                    disabled={!editMode}
                    onChange={e => handleInputChange("fiscalYear", e.target.value)}
                    placeholder="مثال: 2025"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 font-arabic">نسبة الضريبة (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-arabic"
                    value={formData.taxRate}
                    disabled={!editMode}
                    onChange={e => handleInputChange("taxRate", e.target.value)}
                    placeholder="مثال: 15"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 font-arabic">السجل التجاري *</label>
                  <input 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-arabic"
                    value={formData.commercialRegistration} 
                    disabled={!editMode} 
                    onChange={e => handleInputChange("commercialRegistration", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 font-arabic">الملف الضريبي</label>
                  <input 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-arabic"
                    value={formData.taxFile} 
                    disabled={!editMode} 
                    onChange={e => handleInputChange("taxFile", e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 font-arabic">تاريخ السجل</label>
                  <input 
                    type="date" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-arabic"
                    value={formData.registrationDate} 
                    disabled={!editMode} 
                    onChange={e => handleInputChange("registrationDate", e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 font-arabic">جهة الإصدار</label>
                  <input 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-arabic"
                    value={formData.issuingAuthority} 
                    disabled={!editMode} 
                    onChange={e => handleInputChange("issuingAuthority", e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 font-arabic">نوع الشركة</label>
                  <input 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-arabic"
                    value={formData.companyType} 
                    disabled={!editMode} 
                    onChange={e => handleInputChange("companyType", e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 font-arabic">النشاط الرئيسي</label>
                  <input 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-arabic"
                    value={formData.activityType} 
                    disabled={!editMode} 
                    onChange={e => handleInputChange("activityType", e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 font-arabic">الجنسية</label>
                <input 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-arabic"
                  value={formData.nationality} 
                  disabled={!editMode} 
                  onChange={e => handleInputChange("nationality", e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Address Section */}
          <div className="border-b border-gray-200 pb-6">
            <h2 className="text-lg font-medium text-gray-800 mb-4 font-arabic">العنوان</h2>
            <div className="grid grid-cols-1 gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 font-arabic">المدينة</label>
                  <input 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-arabic"
                    value={formData.city} 
                    disabled={!editMode} 
                    onChange={e => handleInputChange("city", e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 font-arabic">المنطقة</label>
                  <input 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-arabic"
                    value={formData.region} 
                    disabled={!editMode} 
                    onChange={e => handleInputChange("region", e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 font-arabic">اسم الشارع</label>
                  <input 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-arabic"
                    value={formData.street} 
                    disabled={!editMode} 
                    onChange={e => handleInputChange("street", e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 font-arabic">اسم الحي</label>
                  <input 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-arabic"
                    value={formData.district} 
                    disabled={!editMode} 
                    onChange={e => handleInputChange("district", e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 font-arabic">رقم المبنى</label>
                  <input 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-arabic"
                    value={formData.buildingNumber} 
                    disabled={!editMode} 
                    onChange={e => handleInputChange("buildingNumber", e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 font-arabic">الرمز البريدي</label>
                  <input 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-arabic"
                    value={formData.postalCode} 
                    disabled={!editMode} 
                    onChange={e => handleInputChange("postalCode", e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Contact Section */}
          <div>
            <h2 className="text-lg font-medium text-gray-800 mb-4 font-arabic">معلومات الاتصال</h2>
            <div className="grid grid-cols-1 gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 font-arabic">كود الدولة</label>
                  <input 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 font-arabic"
                    value={formData.countryCode} 
                    disabled 
                    readOnly 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 font-arabic">رقم الهاتف</label>
                  <input 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-arabic"
                    value={formData.phone} 
                    disabled={!editMode} 
                    onChange={e => handleInputChange("phone", e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 font-arabic">رقم الجوال *</label>
                <input 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-arabic"
                  value={formData.mobile} 
                  disabled={!editMode} 
                  onChange={e => handleInputChange("mobile", e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {editMode && (
            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6">
              <button 
                type="button" 
                onClick={() => {
                  setEditMode(false);
                  // يمكن إضافة استعادة البيانات الأصلية هنا إذا لزم الأمر
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-arabic"
              >
                إلغاء
              </button>
              <button 
                type="submit" 
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 font-arabic"
              >
                حفظ التغييرات
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default SettingsPage;