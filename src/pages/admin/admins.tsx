import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Users, Edit, Trash2, Plus, Search, Filter, UserCheck, Building2, Mail, Phone, IdCard, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/useAuth';
import ProfessionalLoader from '@/components/ProfessionalLoader';

interface Manager {
  id?: string;
  name: string;
  branch: string;
  phone: string;
  iqama: string;
  email: string;
  password: string;
}

const Managers: React.FC = () => {
  const [managers, setManagers] = useState<Manager[]>([]);
  const [branches, setBranches] = useState<{ id: string; name: string; manager: string }[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Manager>({ name: '', branch: '', phone: '', iqama: '', email: '', password: '' });
  const [editId, setEditId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'assigned' | 'unassigned'>('all');
  const { toast } = useToast();
  const { user } = useAuth();

  const filteredManagers = managers.filter(manager => {
    const matchesSearch = manager.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         manager.phone.includes(searchTerm) ||
                         manager.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const branch = branches.find(b => b.manager === manager.name);
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'assigned' && branch) ||
                         (filterStatus === 'unassigned' && !branch);
    
    return matchesSearch && matchesFilter;
  });

  useEffect(() => {
    fetchManagers();
    fetchBranches();
  }, []);

  const fetchManagers = async () => {
    setLoading(true);
    const querySnapshot = await getDocs(collection(db, 'managers'));
    setManagers(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Manager)));
    setLoading(false);
  };

  const fetchBranches = async () => {
    const querySnapshot = await getDocs(collection(db, 'branches'));
    setBranches(querySnapshot.docs.map(doc => ({ id: doc.id, name: doc.data().name, manager: doc.data().manager })));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const existingManagerByName = managers.find(manager => 
      manager.name.toLowerCase() === form.name.toLowerCase() && 
      manager.id !== editId
    );
    
    if (existingManagerByName) {
      toast({
        title: "خطأ في البيانات",
        description: "اسم المدير موجود بالفعل، يرجى اختيار اسم آخر",
        variant: "destructive",
      });
      return;
    }
    
    const existingManagerByEmail = managers.find(manager => 
      manager.email.toLowerCase() === form.email.toLowerCase() && 
      manager.id !== editId
    );
    
    if (existingManagerByEmail) {
      toast({
        title: "خطأ في البيانات",
        description: "البريد الإلكتروني موجود بالفعل، يرجى اختيار إيميل آخر",
        variant: "destructive",
      });
      return;
    }
    
    if (user?.role === 'admin' && user.email.toLowerCase() === form.email.toLowerCase()) {
      toast({
        title: "خطأ في البيانات", 
        description: "لا يمكن استخدام إيميل المدير العام، يرجى اختيار إيميل آخر",
        variant: "destructive",
      });
      return;
    }
    
    try {
      if (editId) {
        const { id, ...managerData } = form;
        await updateDoc(doc(db, 'managers', editId), managerData);
        toast({
          title: "تم التعديل بنجاح",
          description: "تم تعديل بيانات المدير بنجاح",
        });
      } else {
        await addDoc(collection(db, 'managers'), form);
        toast({
          title: "تم الحفظ بنجاح",
          description: "تم إضافة المدير الجديد بنجاح",
        });
      }
      setShowForm(false);
      setForm({ name: '', branch: '', phone: '', iqama: '', email: '', password: '' });
      setEditId(null);
      fetchManagers();
    } catch (error) {
      console.error('Error saving manager:', error);
      toast({
        title: "خطأ في العملية",
        description: "حدث خطأ أثناء حفظ بيانات المدير",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (manager: Manager) => {
    setForm(manager);
    setEditId(manager.id!);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا المدير؟ سيتم إلغاء ربطه بأي فرع مُعين له.')) {
      return;
    }
    try {
      await deleteDoc(doc(db, 'managers', id));
      toast({
        title: "تم الحذف بنجاح",
        description: "تم حذف المدير بنجاح",
      });
      fetchManagers();
    } catch (error) {
      console.error('Error deleting manager:', error);
      toast({
        title: "خطأ في العملية",
        description: "حدث خطأ أثناء حذف المدير",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 w-full">
      <div className="p-2 sm:p-6 w-full max-w-none mx-auto">
        {/* Header Section */}
        <div className="mb-6 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-600 rounded-lg text-white">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">إدارة المديرين</h1>
                <p className="text-gray-600 text-sm">
                  إدارة وتنظيم مديري الفروع والصلاحيات
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={() => { 
                  setShowForm(true); 
                  setForm({ name: '', branch: '', phone: '', iqama: '', email: '', password: '' }); 
                  setEditId(null); 
                }} 
                className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> إضافة مدير
              </Button>
            </div>
          </div>
        </div>
        
        {/* Summary Cards */}
        <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex justify-between items-center">
              <h3 className="text-gray-500 text-sm font-medium">إجمالي المديرين</h3>
              <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold mt-2 text-gray-800">{managers.length}</p>
            <p className="text-xs text-gray-500 mt-1">مدير مسجل في النظام</p>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex justify-between items-center">
              <h3 className="text-gray-500 text-sm font-medium">الفروع المُدارة</h3>
              <div className="p-2 bg-green-100 rounded-lg text-green-600">
                <Building2 className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold mt-2 text-gray-800">
              {branches.filter(b => managers.some(m => m.name === b.manager)).length}
            </p>
            <p className="text-xs text-gray-500 mt-1">من أصل {branches.length} فرع</p>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex justify-between items-center">
              <h3 className="text-gray-500 text-sm font-medium">مديرين غير مُعينين</h3>
              <div className="p-2 bg-orange-100 rounded-lg text-orange-600">
                <UserCheck className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold mt-2 text-gray-800">
              {managers.length - branches.filter(b => managers.some(m => m.name === b.manager)).length}
            </p>
            <p className="text-xs text-gray-500 mt-1">جاهزين للتعيين</p>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex justify-between items-center">
              <h3 className="text-gray-500 text-sm font-medium">فروع بدون مدير</h3>
              <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                <Building2 className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold mt-2 text-gray-800">
              {branches.length - branches.filter(b => managers.some(m => m.name === b.manager)).length}
            </p>
            <p className="text-xs text-gray-500 mt-1">تحتاج تعيين مدير</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden w-full">
          {/* Search and Filter Section */}
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="flex flex-col md:flex-row gap-3 items-start md:items-center justify-between">
              <div className="relative w-full md:w-64">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="ابحث عن مدير..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10 text-sm"
                />
              </div>
              
              <div className="flex gap-2 w-full md:w-auto">
                <Button
                  variant={filterStatus === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus('all')}
                  className="text-xs"
                >
                  الكل
                </Button>
                <Button
                  variant={filterStatus === 'assigned' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus('assigned')}
                  className="text-xs bg-green-50 text-green-700 hover:bg-green-100"
                >
                  مُعين
                </Button>
                <Button
                  variant={filterStatus === 'unassigned' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus('unassigned')}
                  className="text-xs bg-orange-50 text-orange-700 hover:bg-orange-100"
                >
                  غير مُعين
                </Button>
              </div>
            </div>
          </div>
          
          {showForm && (
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-gray-800">{editId ? 'تعديل بيانات المدير' : 'إضافة مدير جديد'}</h3>
              </div>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-4 rounded-lg border border-gray-200">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">الاسم الكامل</Label>
                  <Input 
                    name="name" 
                    value={form.name} 
                    onChange={handleChange} 
                    required 
                    className="text-sm"
                    placeholder="أدخل الاسم الكامل"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">رقم الجوال</Label>
                  <Input 
                    name="phone" 
                    value={form.phone} 
                    onChange={handleChange} 
                    required 
                    inputMode="numeric" 
                    pattern="[0-9]*" 
                    className="text-sm"
                    placeholder="05xxxxxxxx"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">رقم الإقامة/الهوية</Label>
                  <Input 
                    name="iqama" 
                    value={form.iqama} 
                    onChange={handleChange} 
                    required 
                    inputMode="numeric" 
                    pattern="[0-9]*" 
                    className="text-sm"
                    placeholder="1xxxxxxxxx"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">البريد الإلكتروني</Label>
                  <Input 
                    name="email" 
                    value={form.email} 
                    onChange={handleChange} 
                    required 
                    type="email" 
                    className="text-sm"
                    placeholder="manager@example.com"
                  />
                </div>
                
                <div className="md:col-span-2 space-y-2">
                  <Label className="text-sm font-medium text-gray-700">كلمة المرور</Label>
                  <div className="relative">
                    <Input 
                      name="password" 
                      value={form.password} 
                      onChange={handleChange} 
                      required 
                      type={showPassword ? "text" : "password"}
                      className="text-sm pr-10"
                      placeholder="أدخل كلمة مرور قوية"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute left-0 top-0 h-full px-3 text-gray-500 hover:text-gray-700"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
                
                <div className="md:col-span-2 flex gap-3 justify-end pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={() => { setShowForm(false); setEditId(null); setShowPassword(false); }} 
                    className="text-sm"
                  >
                    إلغاء
                  </Button>
                  <Button 
                    type="submit" 
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-sm"
                  >
                    {editId ? 'تحديث البيانات' : 'حفظ المدير'}
                  </Button>
                </div>
              </form>
            </div>
          )}
          
          <div className="overflow-x-auto w-full">
            {filteredManagers.length === 0 && !loading ? (
              <div className="text-center py-12">
                <div className="mx-auto mb-4 p-4 bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center">
                  <Users className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-600 mb-2">
                  {searchTerm || filterStatus !== 'all' ? 'لا توجد نتائج' : 'لا يوجد مديرين'}
                </h3>
                <p className="text-gray-500 text-sm mb-4">
                  {searchTerm || filterStatus !== 'all' 
                    ? 'جرب تغيير معايير البحث أو الفلترة'
                    : 'ابدأ بإضافة مدير جديد لإدارة الفروع'
                  }
                </p>
                {!searchTerm && filterStatus === 'all' && (
                  <Button 
                    onClick={() => { 
                      setShowForm(true); 
                      setForm({ name: '', branch: '', phone: '', iqama: '', email: '', password: '' }); 
                      setEditId(null); 
                    }}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    إضافة أول مدير
                  </Button>
                )}
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">المدير</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">معلومات الاتصال</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">الفرع</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">الحالة</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-6 text-center">
                        <ProfessionalLoader 
                          message="جاري تحميل بيانات المديرين..." 
                          variant="blue" 
                          size="sm" 
                        />
                      </td>
                    </tr>
                  ) : filteredManagers.map((manager) => {
                    const branch = branches.find(b => b.manager === manager.name);
                    return (
                      <tr key={manager.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-800 font-medium">
                              {manager.name.charAt(0)}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">{manager.name}</div>
                              <div className="text-xs text-gray-500">{manager.iqama}</div>
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-4 py-4">
                          <div className="text-sm text-gray-900">{manager.phone}</div>
                          <div className="text-xs text-gray-500">{manager.email}</div>
                        </td>
                        
                        <td className="px-4 py-4 text-center">
                          {branch ? (
                            <Badge className="bg-green-100 text-green-800 text-xs">
                              {branch.name}
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-orange-700 border-orange-200 text-xs">
                              غير مُعين
                            </Badge>
                          )}
                        </td>
                        
                        <td className="px-4 py-4 text-center">
                          <Badge 
                            className={`${
                              branch 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            } text-xs`}
                          >
                            {branch ? 'نشط' : 'في الانتظار'}
                          </Badge>
                        </td>
                        
                        <td className="px-4 py-4 text-center">
                          <div className="flex justify-center gap-1">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="text-blue-600 hover:bg-blue-50 p-2 h-8 w-8" 
                              onClick={() => handleEdit(manager)}
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="text-red-600 hover:bg-red-50 p-2 h-8 w-8" 
                              onClick={() => handleDelete(manager.id!)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Managers;