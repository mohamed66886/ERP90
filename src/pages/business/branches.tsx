import React, { useEffect, useState } from 'react';
import { Edit, Trash2, Plus, Building2 } from 'lucide-react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Breadcrumb from '@/components/Breadcrumb';

interface Branch {
  id?: string;
  code: string; // رقم الفرع
  name: string;
  address: string;
  taxFile: string;
  commercialReg: string;
  postalCode: string;
  poBox: string;
  manager: string;
}

const Branches: React.FC = () => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Branch>({ code: '', name: '', address: '', taxFile: '', commercialReg: '', postalCode: '', poBox: '', manager: '' });
  const [editId, setEditId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [managers, setManagers] = useState<{ id: string; name: string }[]>([]);


  useEffect(() => {
    fetchBranches();
    fetchManagers();

  }, []);

  const fetchBranches = async () => {
    setLoading(true);
    const querySnapshot = await getDocs(collection(db, 'branches'));
    setBranches(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Branch)));
    setLoading(false);
  };

  const fetchManagers = async () => {
    const querySnapshot = await getDocs(collection(db, 'managers'));
    setManagers(querySnapshot.docs.map(doc => ({ id: doc.id, name: doc.data().name })));
  };



  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // التحقق من عدم تكرار اسم أو رقم الفرع
    const existingBranch = branches.find(b =>
      (b.name.toLowerCase() === form.name.toLowerCase() || b.code === form.code) &&
      b.id !== editId
    );
    if (existingBranch) {
      alert('اسم الفرع أو رقم الفرع موجود بالفعل، يرجى اختيار اسم/رقم آخر');
      return;
    }
    
    try {
      if (editId) {
        const { id, ...branchData } = form;
        await updateDoc(doc(db, 'branches', editId), branchData);
      } else {
        await addDoc(collection(db, 'branches'), form);
      }
      setShowForm(false);
      setForm({ code: '', name: '', address: '', taxFile: '', commercialReg: '', postalCode: '', poBox: '', manager: '' });
      setEditId(null);
      fetchBranches();
    } catch (error) {
      console.error('Error saving branch:', error);
      alert('حدث خطأ أثناء حفظ بيانات الفرع');
    }
  };

  const handleEdit = (branch: Branch) => {
    setForm({
      code: branch.code || '',
      name: branch.name,
      address: branch.address,
      taxFile: branch.taxFile,
      commercialReg: branch.commercialReg,
      postalCode: branch.postalCode,
      poBox: branch.poBox,
      manager: branch.manager
    });
    setForm(branch);
    setEditId(branch.id!);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا الفرع؟ سيتم حذف جميع البيانات المرتبطة به.')) {
      return;
    }
    try {
      await deleteDoc(doc(db, 'branches', id));
      fetchBranches();
    } catch (error) {
      console.error('Error deleting branch:', error);
      alert('حدث خطأ أثناء حذف الفرع');
    }
  };

  return (
    <div className="p-4 space-y-6 font-['Tajawal'] bg-gray-50 min-h-screen">
      {/* Breadcrumb Navigation */}
            <div className="p-4 font-['Tajawal'] bg-white rounded-lg shadow-[0_0_10px_rgba(0,0,0,0.1)] animate-[bounce_2s_infinite] relative overflow-hidden">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold text-gray-800">اداره الفروع</h1>
          {/* إيموجي متحركة باي باي */}
          <span className="animate-[wave_2s_infinite] text-3xl mr-3">👋</span>
        </div>
        {/* تأثيرات إضافية */}
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-purple-500 animate-[pulse_3s_infinite]"></div>
      </div>

<style jsx global>{`
  @keyframes bounce {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-5px);
    }
  }
  
  @keyframes wave {
    0%, 100% {
      transform: rotate(0deg);
    }
    25% {
      transform: rotate(20deg);
    }
    75% {
      transform: rotate(-20deg);
    }
  }
  
  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }
`}</style>
      <Breadcrumb
        items={[
          { label: "الرئيسية", to: "/" },
          { label: "ادارة الفروع" }
        ]}
      />
      {/* Header Section */}

      {/* ملاحظة: إذا أردت الأنيميشن، أضف keyframes في ملف CSS الرئيسي */}

      {/* زر إضافة فرع */}
      <div className="flex justify-end">
        <Button
          onClick={() => {
            const maxCode = branches.length > 0 ? Math.max(...branches.map(b => parseInt(b.code, 10) || 0)) : 100;
            setForm({ code: String(maxCode + 1), name: '', address: '', taxFile: '', commercialReg: '', postalCode: '', poBox: '', manager: '' });
            setShowForm(true);
            setEditId(null);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 px-8 py-2 rounded-md shadow-md transition-all duration-300 hover:shadow-lg transform hover:-translate-y-0.5"
        >
          <Plus className="w-4 h-4" /> إضافة فرع
        </Button>
      </div>

      {/* نموذج إضافة/تعديل فرع */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200 mb-4">
          <h3 className="text-xl font-bold text-gray-800 mb-6">{editId ? 'تعديل الفرع' : 'إضافة فرع جديد'}</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="block text-sm font-medium text-gray-800 mb-2">رقم الفرع</Label>
              <Input
                name="code"
                value={form.code}
                disabled
                required
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="يتم توليده تلقائيًا"
                className="border-gray-300 focus:ring-2 bg-gray-50 text-gray-800"
              />
            </div>
            <div>
              <Label className="block text-sm font-medium text-gray-800 mb-2">اسم الفرع</Label>
              <Input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="border-gray-300 focus:ring-2 bg-gray-50 text-gray-800"
              />
            </div>
            <div>
              <Label className="block text-sm font-medium text-gray-800 mb-2">العنوان</Label>
              <Input
                name="address"
                value={form.address}
                onChange={handleChange}
                required
                className="border-gray-300 focus:ring-2 bg-gray-50 text-gray-800"
              />
            </div>
            <div>
              <Label className="block text-sm font-medium text-gray-800 mb-2">الملف الضريبي</Label>
              <Input name="taxFile" value={form.taxFile} onChange={handleChange} required inputMode="numeric" pattern="[0-9]*" className="border-gray-300 focus:ring-2 bg-gray-50 text-gray-800" />
            </div>
            <div>
              <Label className="block text-sm font-medium text-gray-800 mb-2">السجل التجاري</Label>
              <Input name="commercialReg" value={form.commercialReg} onChange={handleChange} required inputMode="numeric" pattern="[0-9]*" className="border-gray-300 focus:ring-2 bg-gray-50 text-gray-800" />
            </div>
            <div>
              <Label className="block text-sm font-medium text-gray-800 mb-2">الرمز البريدي</Label>
              <Input name="postalCode" value={form.postalCode} onChange={handleChange} required inputMode="numeric" pattern="[0-9]*" className="border-gray-300 focus:ring-2 bg-gray-50 text-gray-800" />
            </div>
            <div>
              <Label className="block text-sm font-medium text-gray-800 mb-2">الصندوق البريدي</Label>
              <Input name="poBox" value={form.poBox} onChange={handleChange} required inputMode="numeric" pattern="[0-9]*" className="border-gray-300 focus:ring-2 bg-gray-50 text-gray-800" />
            </div>
            <div>
              <Label className="block text-sm font-medium text-gray-800 mb-2">اسم المدير المسؤول</Label>
              <select name="manager" value={form.manager} onChange={handleChange} required className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 bg-gray-50 text-gray-800">
                <option value="">اختر المدير</option>
                {managers.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
              </select>
            </div>
            <div className="col-span-2 flex gap-3 justify-end mt-4">
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 transition-all duration-300 hover:scale-105"
              >
                {editId ? 'تعديل' : 'إضافة'}
              </Button>
              <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditId(null); }} className="border-gray-300 bg-gray-50 text-gray-700 hover:bg-gray-100 transition-all duration-300">إلغاء</Button>
            </div>
          </form>
        </div>
      )}

      {/* جدول الفروع */}
      <div className="bg-white rounded-lg shadow-xl overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full text-center">
            <thead>
              <tr className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                <th className="px-6 py-4 text-sm font-medium border-b border-blue-800">اسم الفرع</th>
                <th className="px-6 py-4 text-sm font-medium border-b border-blue-800">المدير المسؤول عنه</th>
                <th className="px-6 py-4 text-sm font-medium border-b border-blue-800">التعديل</th>
                <th className="px-6 py-4 text-sm font-medium border-b border-blue-800">الحذف</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan={4} className="text-center py-8 text-gray-700 font-medium">جاري التحميل...</td></tr>
              ) : branches.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-8 text-gray-500">لا يوجد فروع</td></tr>
              ) : branches.map((branch, idx) => (
                <tr key={branch.id} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors`}>
                  <td className="px-6 py-4 text-sm border-b border-gray-200">{branch.name}</td>
                  <td className="px-6 py-4 text-sm border-b border-gray-200">{branch.manager}</td>
                  <td className="px-6 py-4 text-sm border-b border-gray-200">
                    <Button
                      variant="ghost"
                      className="hover:bg-gray-50/80 transition-all duration-200 rounded-lg"
                      style={{ color: '#635ca8' }}
                      onClick={() => handleEdit(branch)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </td>
                  <td className="px-6 py-4 text-sm border-b border-gray-200">
                    <Button variant="ghost" className="text-red-600 hover:bg-red-50/80 transition-all duration-200 rounded-lg" onClick={() => handleDelete(branch.id!)}><Trash2 className="w-4 h-4" /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Branches;
