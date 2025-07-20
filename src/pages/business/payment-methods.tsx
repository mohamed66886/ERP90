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

interface PaymentMethod {
  id: string;
  name: string;
  imageUrl: string;
}

const PaymentMethodsPage: React.FC = () => {
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
    <div className="w-full px-2 md:px-8 py-8">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            إدارة طرق الدفع
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form
            onSubmit={handleAddOrEdit}
            className="mb-8 space-y-4 bg-muted/50 p-6 rounded-lg"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium" htmlFor="name">
                  اسم طريقة الدفع
                </label>
                <Input
                  id="name"
                  placeholder="مثال: PayPal, بطاقة ائتمان"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium" htmlFor="imageUrl">
                  رابط الصورة
                </label>
                <Input
                  id="imageUrl"
                  placeholder="https://example.com/image.png (اختياري)"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              <Button type="submit" disabled={loading}>
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
                >
                  إلغاء
                </Button>
              )}
            </div>
          </form>

          <div className="overflow-x-auto">
            {loading && methods.length === 0 ? (
              <div className="flex justify-center items-center h-32">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : methods.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                لا توجد طرق دفع
              </div>
            ) : (
              <Table className="border rounded-lg min-w-[700px]">
                <TableHeader className="bg-gray-100 dark:bg-gray-800">
                  <TableRow>
                    <TableHead className="w-[60px] text-center text-base font-bold">#</TableHead>
                    <TableHead className="text-center text-base font-bold">الاسم</TableHead>
                    <TableHead className="text-center text-base font-bold">الصورة</TableHead>
                    <TableHead className="text-center text-base font-bold">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {methods.map((method, idx) => (
                    <TableRow
                      key={method.id}
                      className={idx % 2 === 0 ? "bg-white dark:bg-gray-900" : "bg-gray-50 dark:bg-gray-800"}
                    >
                      <TableCell className="text-center font-semibold">{idx + 1}</TableCell>
                      <TableCell className="text-center font-medium">{method.name}</TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center">
                          <img
                            src={
                              method.imageUrl && method.imageUrl.trim() !== ""
                                ? method.imageUrl
                                : "https://via.placeholder.com/40"
                            }
                            alt={method.name}
                            className="w-12 h-12 object-contain rounded-md bg-white p-1 border shadow-sm"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                "https://via.placeholder.com/40";
                            }}
                          />
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(method)}
                            disabled={loading}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            تعديل
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(method.id)}
                            disabled={loading}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            حذف
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentMethodsPage;