import React, { useEffect, useState } from 'react';
import { Edit, Trash2, Plus, Building2, ChevronDown, ChevronUp } from 'lucide-react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Breadcrumb from '@/components/Breadcrumb';

interface Branch {
  id?: string;
  code: string;
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
  const [form, setForm] = useState<Branch>({ 
    code: '', 
    name: '', 
    address: '', 
    taxFile: '', 
    commercialReg: '', 
    postalCode: '', 
    poBox: '', 
    manager: '' 
  });
  const [editId, setEditId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [managers, setManagers] = useState<{ id: string; name: string }[]>([]);
  const [expandedBranch, setExpandedBranch] = useState<string | null>(null);

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
    setForm(branch);
    setEditId(branch.id!);
    setShowForm(true);
    setExpandedBranch(null);
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

  const toggleExpandBranch = (id: string) => {
    setExpandedBranch(expandedBranch === id ? null : id);
  };

  return (
    <div className="p-4 space-y-6 font-['Tajawal'] bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="p-4 font-['Tajawal'] bg-white rounded-lg shadow-[0_0_10px_rgba(0,0,0,0.1)] relative overflow-hidden">
        <div className="flex items-center justify-between">
          <h1 className="text-xl md:text-2xl font-bold text-gray-800">اداره الفروع</h1>
          <span className="animate-[wave_2s_infinite] text-2xl md:text-3xl">👋</span>
        </div>
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-purple-500 animate-[pulse_3s_infinite]"></div>
      </div>

      <Breadcrumb
        items={[
          { label: "الرئيسية", to: "/" },
          { label: "ادارة الفروع" }
        ]}
      />

      {/* Add Branch Button - Mobile & Desktop */}
      <div className="flex justify-end">
        <Button
          onClick={() => {
            const maxCode = branches.length > 0 ? Math.max(...branches.map(b => parseInt(b.code, 10) || 0)) : 0;
            setForm({ 
              code: String(maxCode + 1), 
              name: '', 
              address: '', 
              taxFile: '', 
              commercialReg: '', 
              postalCode: '', 
              poBox: '', 
              manager: '' 
            });
            setShowForm(true);
            setEditId(null);
            setExpandedBranch(null);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 px-4 py-2 md:px-8 md:py-2 rounded-md shadow-md transition-all duration-300 hover:shadow-lg"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden md:inline">إضافة فرع</span>
        </Button>
      </div>

      {/* Form Section */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-lg p-4 md:p-6 border border-gray-200 mb-4">
          <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-4 md:mb-6">
            {editId ? 'تعديل الفرع' : 'إضافة فرع جديد'}
          </h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
            {/* Form Fields */}
            <div>
              <Label className="block text-sm font-medium text-gray-800 mb-1 md:mb-2">رقم الفرع</Label>
              <Input
                name="code"
                value={form.code}
                disabled
                required
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="يتم توليده تلقائيًا"
                className="border-gray-300 focus:ring-2 bg-gray-50 text-gray-800 text-sm md:text-base"
              />
            </div>
            
            <div>
              <Label className="block text-sm font-medium text-gray-800 mb-1 md:mb-2">اسم الفرع</Label>
              <Input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="border-gray-300 focus:ring-2 bg-gray-50 text-gray-800 text-sm md:text-base"
              />
            </div>
            
            <div className="md:col-span-2">
              <Label className="block text-sm font-medium text-gray-800 mb-1 md:mb-2">العنوان</Label>
              <Input
                name="address"
                value={form.address}
                onChange={handleChange}
                required
                className="border-gray-300 focus:ring-2 bg-gray-50 text-gray-800 text-sm md:text-base"
              />
            </div>
            
            <div>
              <Label className="block text-sm font-medium text-gray-800 mb-1 md:mb-2">الملف الضريبي</Label>
              <Input 
                name="taxFile" 
                value={form.taxFile} 
                onChange={handleChange} 
                required 
                inputMode="numeric" 
                pattern="[0-9]*" 
                className="border-gray-300 focus:ring-2 bg-gray-50 text-gray-800 text-sm md:text-base" 
              />
            </div>
            
            <div>
              <Label className="block text-sm font-medium text-gray-800 mb-1 md:mb-2">السجل التجاري</Label>
              <Input 
                name="commercialReg" 
                value={form.commercialReg} 
                onChange={handleChange} 
                required 
                inputMode="numeric" 
                pattern="[0-9]*" 
                className="border-gray-300 focus:ring-2 bg-gray-50 text-gray-800 text-sm md:text-base" 
              />
            </div>
            
            <div>
              <Label className="block text-sm font-medium text-gray-800 mb-1 md:mb-2">الرمز البريدي</Label>
              <Input 
                name="postalCode" 
                value={form.postalCode} 
                onChange={handleChange} 
                required 
                inputMode="numeric" 
                pattern="[0-9]*" 
                className="border-gray-300 focus:ring-2 bg-gray-50 text-gray-800 text-sm md:text-base" 
              />
            </div>
            
            <div>
              <Label className="block text-sm font-medium text-gray-800 mb-1 md:mb-2">الصندوق البريدي</Label>
              <Input 
                name="poBox" 
                value={form.poBox} 
                onChange={handleChange} 
                required 
                inputMode="numeric" 
                pattern="[0-9]*" 
                className="border-gray-300 focus:ring-2 bg-gray-50 text-gray-800 text-sm md:text-base" 
              />
            </div>
            
            <div className="md:col-span-2">
              <Label className="block text-sm font-medium text-gray-800 mb-1 md:mb-2">اسم المدير المسؤول</Label>
              <select 
                name="manager" 
                value={form.manager} 
                onChange={handleChange} 
                required 
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 bg-gray-50 text-gray-800 text-sm md:text-base"
              >
                <option value="">اختر المدير</option>
                {managers.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
              </select>
            </div>
            
            {/* Form Buttons */}
            <div className="md:col-span-2 flex gap-3 justify-end mt-2 md:mt-4">
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 md:px-8 transition-all duration-300 hover:scale-105 text-sm md:text-base"
              >
                {editId ? 'تعديل' : 'إضافة'}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => { setShowForm(false); setEditId(null); }} 
                className="border-gray-300 bg-gray-50 text-gray-700 hover:bg-gray-100 transition-all duration-300 text-sm md:text-base"
              >
                إلغاء
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Branches List - Mobile View */}
      <div className="md:hidden space-y-3">
        {loading ? (
          <div className="text-center py-8 text-gray-700 font-medium">جاري التحميل...</div>
        ) : branches.length === 0 ? (
          <div className="text-center py-8 text-gray-500">لا يوجد فروع</div>
        ) : branches.map((branch) => (
          <div key={branch.id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
            <div 
              className="p-4 flex justify-between items-center cursor-pointer"
              onClick={() => toggleExpandBranch(branch.id!)}
            >
              <div>
                <h3 className="font-bold text-gray-800">{branch.name}</h3>
                <p className="text-sm text-gray-600">{branch.manager}</p>
              </div>
              <div className="flex items-center">
                {expandedBranch === branch.id ? (
                  <ChevronUp className="w-5 h-5 text-gray-500" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                )}
              </div>
            </div>
            
            {expandedBranch === branch.id && (
              <div className="p-4 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <p className="text-xs text-gray-500">رقم الفرع</p>
                    <p className="text-sm font-medium">{branch.code}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">العنوان</p>
                    <p className="text-sm font-medium">{branch.address}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">الملف الضريبي</p>
                    <p className="text-sm font-medium">{branch.taxFile}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">السجل التجاري</p>
                    <p className="text-sm font-medium">{branch.commercialReg}</p>
                  </div>
                </div>
                
                <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                  <Button
                    variant="ghost"
                    className="text-blue-600 hover:bg-blue-50/80 p-2"
                    onClick={() => handleEdit(branch)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="text-red-600 hover:bg-red-50/80 p-2" 
                    onClick={() => handleDelete(branch.id!)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Branches Table - Desktop View */}
      <div className="hidden md:block bg-white rounded-lg shadow-xl overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full text-center">
            <thead>
              <tr className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                <th className="px-4 py-3 text-sm font-medium border-b border-blue-800">رقم الفرع</th>
                <th className="px-4 py-3 text-sm font-medium border-b border-blue-800">اسم الفرع</th>
                <th className="px-4 py-3 text-sm font-medium border-b border-blue-800">المدير المسؤول</th>
                <th className="px-4 py-3 text-sm font-medium border-b border-blue-800">العنوان</th>
                <th className="px-4 py-3 text-sm font-medium border-b border-blue-800">العمليات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan={5} className="text-center py-8 text-gray-700 font-medium">جاري التحميل...</td></tr>
              ) : branches.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-8 text-gray-500">لا يوجد فروع</td></tr>
              ) : branches.map((branch, idx) => (
                <tr key={branch.id} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors`}>
                  <td className="px-4 py-3 text-sm border-b border-gray-200">{branch.code}</td>
                  <td className="px-4 py-3 text-sm border-b border-gray-200">{branch.name}</td>
                  <td className="px-4 py-3 text-sm border-b border-gray-200">{branch.manager}</td>
                  <td className="px-4 py-3 text-sm border-b border-gray-200">{branch.address}</td>
                  <td className="px-4 py-3 text-sm border-b border-gray-200">
                    <div className="flex justify-center gap-2">
                      <Button
                        variant="ghost"
                        className="text-blue-600 hover:bg-blue-50/80 p-2"
                        onClick={() => handleEdit(branch)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        className="text-red-600 hover:bg-red-50/80 p-2" 
                        onClick={() => handleDelete(branch.id!)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
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