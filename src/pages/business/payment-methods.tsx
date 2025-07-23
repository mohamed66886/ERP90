import React, { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  Timestamp,
} from "firebase/firestore";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Loader2, Edit, Trash2, PlusCircle } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Breadcrumb from "@/components/Breadcrumb";

interface PaymentMethod {
  id: string;
  name: string;
  imageUrl: string;
}

const PaymentMethodsPage: React.FC = () => {
  // ...existing code...
  // إضافة الأنيميشن وخط Tajawal للـ head
  useEffect(() => {
    if (typeof document !== 'undefined') {
      // خط Tajawal
      if (!document.getElementById('tajawal-font')) {
        const link = document.createElement('link');
        link.id = 'tajawal-font';
        link.rel = 'stylesheet';
        link.href = 'https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700&display=swap';
        document.head.appendChild(link);
      }
      // أنيميشن
      if (!document.getElementById('payment-methods-animations')) {
        const style = document.createElement('style');
        style.id = 'payment-methods-animations';
        style.innerHTML = `
          @keyframes bounce { 0%,100%{transform:translateY(0);} 50%{transform:translateY(-5px);} }
          @keyframes wave { 0%,100%{transform:rotate(0deg);} 25%{transform:rotate(20deg);} 75%{transform:rotate(-20deg);} }
          @keyframes pulse { 0%,100%{opacity:1;} 50%{opacity:0.5;} }
        `;
        document.head.appendChild(style);
      }
    }
  }, []);
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [name, setName] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // جلب طرق الدفع من Firebase
  const fetchMethods = async () => {
    setLoading(true);
    setError(null);
    try {
      const snapshot = await getDocs(collection(db, "paymentMethods"));
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as PaymentMethod[];
      setMethods(data);
    } catch (err) {
      setError("فشل في جلب طرق الدفع");
      toast.error("فشل في جلب طرق الدفع");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMethods();
  }, []);

  const handleAddOrEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      setError("اسم طريقة الدفع مطلوب");
      toast.warning("الرجاء إدخال اسم طريقة الدفع");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      if (editId) {
        // تعديل طريقة دفع موجودة
        const ref = doc(db, "paymentMethods", editId);
        await updateDoc(ref, { name, imageUrl });
        setMethods((prev) =>
          prev.map((m) => (m.id === editId ? { ...m, name, imageUrl } : m))
        );
        setEditId(null);
        toast.success("تم تحديث طريقة الدفع بنجاح");
      } else {
        // إضافة طريقة دفع جديدة
        const docRef = await addDoc(collection(db, "paymentMethods"), {
          name,
          imageUrl: imageUrl || "",
          createdAt: Timestamp.now(),
        });
        setMethods((prev) => [...prev, { id: docRef.id, name, imageUrl }]);
        toast.success("تم إضافة طريقة الدفع بنجاح");
      }
      setName("");
      setImageUrl("");
    } catch (err) {
      setError("فشل في حفظ طريقة الدفع");
      toast.error("فشل في حفظ طريقة الدفع");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (method: PaymentMethod) => {
    setName(method.name);
    setImageUrl(method.imageUrl);
    setEditId(method.id);
  };

  const handleDelete = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await deleteDoc(doc(db, "paymentMethods", id));
      setMethods((prev) => prev.filter((m) => m.id !== id));
      if (editId === id) {
        setEditId(null);
        setName("");
        setImageUrl("");
      }
      toast.success("تم حذف طريقة الدفع بنجاح");
    } catch (err) {
      setError("فشل في حذف طريقة الدفع");
      toast.error("فشل في حذف طريقة الدفع");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditId(null);
    setName("");
    setImageUrl("");
  };

  return (
    <div className="p-4 space-y-6 font-['Tajawal'] bg-gray-50 min-h-screen">
      {/* Breadcrumb Navigation */}
            {/* Header Card with Animation */}
      <div className="p-4 font-['Tajawal'] bg-white rounded-lg shadow-[0_0_10px_rgba(0,0,0,0.1)] animate-[bounce_2s_infinite] relative overflow-hidden">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold text-gray-800">طرق الدفع</h1>
          <span className="animate-[wave_2s_infinite] text-3xl mr-3">💳</span>
        </div>
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-purple-500 animate-[pulse_3s_infinite]"></div>
      </div>
      <Breadcrumb
        items={[
          { label: "الرئيسية", to: "/" },

          { label: "ادارة طرق الدفع" }
        ]}
      />




      {/* Breadcrumb Navigation */}
      {/* يمكنك استيراد Breadcrumb إذا كان متاحًا */}
      {/* <Breadcrumb items={[{ label: "الرئيسية", to: "/" }, { label: "الإعدادات", to: "/settings" }, { label: "طرق الدفع" }]} /> */}

      {/* Form Card */}
      <div className="w-full bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-4 pb-0 border-r-[6px] border-blue-600 bg-gradient-to-r from-blue-50 to-white">
          <h2 className="text-xl font-bold text-gray-800">إدارة طرق الدفع</h2>
          <hr className="my-4 border-t-2 border-blue-100" />
        </div>
        <div className="p-6">
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleAddOrEdit} className="mb-8 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-base font-bold text-gray-700" htmlFor="name">اسم طريقة الدفع</label>
                <Input
                  id="name"
                  placeholder="مثال: PayPal, بطاقة ائتمان"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                  className="border border-gray-300 bg-white px-3 py-2 text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 rounded-md h-12"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-base font-bold text-gray-700" htmlFor="imageUrl">رابط الصورة</label>
                <Input
                  id="imageUrl"
                  placeholder="https://example.com/image.png (اختياري)"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  disabled={loading}
                  className="border border-gray-300 bg-white px-3 py-2 text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 rounded-md h-12"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
              <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 rounded-md shadow-md transition-all duration-300 hover:shadow-lg transform hover:-translate-y-0.5">
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : editId ? (
                  <Edit className="mr-2 h-4 w-4" />
                ) : (
                  <PlusCircle className="mr-2 h-4 w-4" />
                )}
                {editId ? "تحديث الطريقة" : "إضافة طريقة"}
              </Button>
              {editId && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={loading}
                  className="border border-gray-300 px-8 py-2 rounded-md"
                >
                  إلغاء
                </Button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex justify-between items-center bg-white rounded-lg shadow-lg p-4 border-r-[6px] border-blue-600">
        <span className="font-bold text-lg text-gray-800">طرق الدفع المسجلة</span>
        <span className="text-base font-medium text-blue-700">عدد الطرق: {methods.length}</span>
      </div>

      {/* Results Table */}
      <div className="bg-white rounded-lg shadow-xl overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          {loading && methods.length === 0 ? (
            <div className="flex justify-center items-center p-12">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : methods.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">لا توجد طرق دفع</div>
          ) : (
            <table className="min-w-full text-center">
              <thead>
                <tr className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                  <th className="px-6 py-4 text-sm font-medium border-b border-blue-800">#</th>
                  <th className="px-6 py-4 text-sm font-medium border-b border-blue-800">الاسم</th>
                  <th className="px-6 py-4 text-sm font-medium border-b border-blue-800">الصورة</th>
                  <th className="px-6 py-4 text-sm font-medium border-b border-blue-800">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {methods.map((method, idx) => (
                  <tr
                    key={method.id}
                    className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors`}
                  >
                    <td className="px-6 py-4 text-sm border-b border-gray-200 font-semibold">{idx + 1}</td>
                    <td className="px-6 py-4 text-sm border-b border-gray-200 font-medium">{method.name}</td>
                    <td className="px-6 py-4 text-sm border-b border-gray-200">
                      <div className="flex items-center justify-center">
                        <img
                          src={method.imageUrl && method.imageUrl.trim() !== "" ? method.imageUrl : "https://via.placeholder.com/40"}
                          alt={method.name}
                          className="w-12 h-12 object-contain rounded-md bg-white p-1 border shadow-sm"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "https://via.placeholder.com/40";
                          }}
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm border-b border-gray-200">
                      <div className="flex justify-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(method)}
                          disabled={loading}
                          className="border border-gray-300 px-4 py-1 rounded-md"
                        >
                          <Edit className="h-4 w-4 mr-1" />تعديل
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(method.id)}
                          disabled={loading}
                          className="px-4 py-1 rounded-md"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />حذف
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

    </div>
  );
};

export default PaymentMethodsPage;