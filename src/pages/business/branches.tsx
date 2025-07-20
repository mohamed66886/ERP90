import React, { useEffect, useState } from 'react';
import { Edit, Trash2, Plus } from 'lucide-react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Branch {
  id?: string;
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
  const [form, setForm] = useState<Branch>({ name: '', address: '', taxFile: '', commercialReg: '', postalCode: '', poBox: '', manager: '' });
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
    
    // التحقق من عدم تكرار اسم الفرع
    const existingBranch = branches.find(branch => 
      branch.name.toLowerCase() === form.name.toLowerCase() && 
      branch.id !== editId
    );
    
    if (existingBranch) {
      alert('اسم الفرع موجود بالفعل، يرجى اختيار اسم آخر');
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
      setForm({ name: '', address: '', taxFile: '', commercialReg: '', postalCode: '', poBox: '', manager: '' });
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
    <div className="min-h-screen bg-gray-50 animate-fade-in">
      <div className="p-4 md:p-6 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8 bg-white/80 backdrop-blur-xl p-6 rounded-2xl border border-white/20 ring-1 ring-gray-200/50">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">إدارة الفروع</h1>
              <p className="text-gray-600 text-lg">
                إدارة وتنظيم فروع صالونات الحلاقة
              </p>
            </div>
            <Button 
              onClick={() => { 
                setShowForm(true); 
                setForm({ name: '', address: '', taxFile: '', commercialReg: '', postalCode: '', poBox: '', manager: '' });
                setEditId(null); 
              }} 
              className="text-white backdrop-blur-sm transition-all duration-300 hover:scale-105 flex items-center gap-2"
              style={{ backgroundColor: '#635ca8' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#574c9a'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#635ca8'}
            >
              <Plus className="w-4 h-4" /> إضافة فرع
            </Button>
          </div>
        </div>
        
        {/* إحصائيات سريعة */}
        <div className="mb-8 bg-white/80 backdrop-blur-xl p-6 rounded-2xl border border-white/20 ring-1 ring-gray-200/50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-xl ring-1 ring-gray-200/50 text-center backdrop-blur-sm" style={{ backgroundColor: '#f8fafc' }}>
              <div className="text-3xl font-bold" style={{ color: '#635ca8' }}>{branches.length}</div>
              <div className="text-sm font-medium" style={{ color: '#635ca8' }}>إجمالي الفروع</div>
            </div>
            <div className="p-6 rounded-xl ring-1 ring-emerald-200/50 text-center backdrop-blur-sm" style={{ backgroundColor: '#f0fdf4' }}>
              <div className="text-3xl font-bold text-emerald-700">{managers.length}</div>
              <div className="text-sm text-emerald-600 font-medium">عدد المدراء</div>
            </div>
            <div className="p-6 rounded-xl ring-1 ring-purple-200/50 text-center backdrop-blur-sm" style={{ backgroundColor: '#faf5ff' }}>
              <div className="text-3xl font-bold text-purple-700">{branches.filter(b => b.manager).length}</div>
              <div className="text-sm text-purple-600 font-medium">الفروع المُدارة</div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/20 ring-1 ring-gray-200/50">
          {showForm && (
            <div className="p-6 border-b border-gray-200/50">
              <h3 className="text-xl font-bold text-gray-800 mb-6">{editId ? 'تعديل الفرع' : 'إضافة فرع جديد'}</h3>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gradient-to-r from-gray-50/80 to-gray-100/80 p-6 rounded-xl ring-1 ring-gray-200/50 backdrop-blur-sm">
                <div>
                  <Label className="block text-sm font-medium text-gray-800 mb-2">اسم الفرع</Label>
                  <Input 
                    name="name" 
                    value={form.name} 
                    onChange={handleChange} 
                    required 
                    className="border-gray-300/50 focus:ring-2 bg-gray-50/80 text-gray-800 backdrop-blur-sm" 
                    style={{'--tw-ring-color': '#635ca8'} as React.CSSProperties}
                  />
                </div>
                <div>
                  <Label className="block text-sm font-medium text-gray-800 mb-2">العنوان</Label>
                  <Input 
                    name="address" 
                    value={form.address} 
                    onChange={handleChange} 
                    required 
                    className="border-gray-300/50 focus:ring-2 bg-gray-50/80 text-gray-800 backdrop-blur-sm" 
                    style={{'--tw-ring-color': '#635ca8'} as React.CSSProperties}
                  />
                </div>
                <div>
                  <Label className="block text-sm font-medium text-gray-800 mb-2">الملف الضريبي</Label>
                  <Input name="taxFile" value={form.taxFile} onChange={handleChange} required inputMode="numeric" pattern="[0-9]*" className="border-gray-300/50 focus:ring-2 bg-gray-50/80 text-gray-800 backdrop-blur-sm" style={{'--tw-ring-color': '#635ca8'} as React.CSSProperties} />
                </div>
                <div>
                  <Label className="block text-sm font-medium text-gray-800 mb-2">السجل التجاري</Label>
                  <Input name="commercialReg" value={form.commercialReg} onChange={handleChange} required inputMode="numeric" pattern="[0-9]*" className="border-gray-300/50 focus:ring-2 bg-gray-50/80 text-gray-800 backdrop-blur-sm" style={{'--tw-ring-color': '#635ca8'} as React.CSSProperties} />
                </div>
                <div>
                  <Label className="block text-sm font-medium text-gray-800 mb-2">الرمز البريدي</Label>
                  <Input name="postalCode" value={form.postalCode} onChange={handleChange} required inputMode="numeric" pattern="[0-9]*" className="border-gray-300/50 focus:ring-2 bg-gray-50/80 text-gray-800 backdrop-blur-sm" style={{'--tw-ring-color': '#635ca8'} as React.CSSProperties} />
                </div>
                <div>
                  <Label className="block text-sm font-medium text-gray-800 mb-2">الصندوق البريدي</Label>
                  <Input name="poBox" value={form.poBox} onChange={handleChange} required inputMode="numeric" pattern="[0-9]*" className="border-gray-300/50 focus:ring-2 bg-gray-50/80 text-gray-800 backdrop-blur-sm" style={{'--tw-ring-color': '#635ca8'} as React.CSSProperties} />
                </div>
                <div>
                  <Label className="block text-sm font-medium text-gray-800 mb-2">اسم المدير المسؤول</Label>
                  <select name="manager" value={form.manager} onChange={handleChange} required className="w-full border border-gray-300/50 rounded-md px-3 py-2 focus:ring-2 bg-gray-50/80 text-gray-800 backdrop-blur-sm">
                    <option value="">اختر المدير</option>
                    {managers.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
                  </select>
                </div>

                <div className="col-span-2 flex gap-3 justify-end mt-4">
                  <Button 
                    type="submit" 
                    className="text-white px-8 transition-all duration-300 hover:scale-105"
                    style={{ backgroundColor: '#635ca8' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#574c9a'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#635ca8'}
                  >
                    {editId ? 'تعديل' : 'إضافة'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditId(null); }} className="border-gray-300/50 bg-gray-50/80 text-gray-700 hover:bg-gray-100/80 transition-all duration-300">إلغاء</Button>
                </div>
              </form>
            </div>
          )}
          
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white/90 rounded-xl ring-1 ring-gray-200/50 backdrop-blur-sm">
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc' }}>
                    <th className="py-4 px-6 text-sm font-bold text-gray-800 border-b border-gray-300/50">اسم الفرع</th>
                    <th className="py-4 px-6 text-sm font-bold text-gray-800 border-b border-gray-300/50">المدير المسؤول عنه</th>
                    <th className="py-4 px-6 text-sm font-bold text-gray-800 border-b border-gray-300/50">التعديل</th>
                    <th className="py-4 px-6 text-sm font-bold text-gray-800 border-b border-gray-300/50">الحذف</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={4} className="text-center py-8 text-gray-700 font-medium">جاري التحميل...</td></tr>
                  ) : branches.length === 0 ? (
                    <tr><td colSpan={4} className="text-center py-8 text-gray-500">لا يوجد فروع</td></tr>
                  ) : branches.map((branch) => (
                    <tr key={branch.id} className="border-b border-gray-100/50 hover:bg-gray-50/30 transition-all duration-200">
                      <td className="py-4 px-6 text-gray-800 font-medium">{branch.name}</td>
                      <td className="py-4 px-6 text-gray-700">{branch.manager}</td>
                      <td className="py-4 px-6">
                        <Button 
                          variant="ghost" 
                          className="hover:bg-gray-50/80 transition-all duration-200 rounded-lg" 
                          style={{ color: '#635ca8' }}
                          onClick={() => handleEdit(branch)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </td>
                      <td className="py-4 px-6">
                        <Button variant="ghost" className="text-red-600 hover:bg-red-50/80 transition-all duration-200 rounded-lg" onClick={() => handleDelete(branch.id!)}><Trash2 className="w-4 h-4" /></Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Branches;
