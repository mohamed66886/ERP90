import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {  collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
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

  // تصفية المديرين
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
    
    // التحقق من عدم تكرار اسم المدير
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
    
    // التحقق من عدم تكرار الإيميل
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
    
    // التحقق من عدم تكرار إيميل المدير العام
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-50/30 to-gray-50/50 animate-fade-in">
      <div className="p-4 md:p-6 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8 bg-white/90 backdrop-blur-xl p-8 rounded-3xl border border-white/30 ring-1 ring-gray-200/30">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-gradient-to-br from-custom-purple to-custom-purple-dark rounded-2xl">
                <Users className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-800 mb-2">إدارة المديرين</h1>
                <p className="text-gray-600 text-lg">
                  إدارة وتنظيم مديري الفروع والصلاحيات
                </p>
                <div className="flex items-center gap-4 mt-3">
                  <Badge variant="outline" className="bg-[#635ca8]/10 text-[#635ca8] border-[#635ca8]/30">
                    <UserCheck className="w-3 h-3 mr-1" />
                    {managers.length} مدير
                  </Badge>
                  <Badge variant="outline" className="bg-emerald-50/80 text-emerald-700 border-emerald-200">
                    <Building2 className="w-3 h-3 mr-1" />
                    {branches.filter(b => managers.some(m => m.name === b.manager)).length} فرع مُدار
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <Button 
                onClick={() => { 
                  setShowForm(true); 
                  setForm({ name: '', branch: '', phone: '', iqama: '', email: '', password: '' }); 
                  setEditId(null); 
                }} 
                className="bg-gradient-to-r from-custom-purple to-custom-purple-dark hover:from-custom-purple-dark hover:to-custom-purple text-white ring-2 ring-purple-400/30 backdrop-blur-sm transition-all duration-300 hover:scale-105 flex items-center gap-2 px-6 py-3 text-lg font-medium"
              >
                <Plus className="w-5 h-5" /> إضافة مدير جديد
              </Button>
            </div>
          </div>
        </div>
        
        {/* إحصائيات متقدمة */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-white to-[#635ca8]/10 backdrop-blur-xl p-6 rounded-2xl border border-white/40 ring-1 ring-[#635ca8]/20">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-custom-purple to-custom-purple-dark rounded-xl">
                <Users className="w-6 h-6 text-white" />
              </div>
              <Badge className="bg-[#635ca8]/10 text-[#635ca8] font-semibold">إجمالي</Badge>
            </div>
            <div className="text-3xl font-bold text-gray-800 mb-1">{managers.length}</div>
            <div className="text-sm text-gray-600 font-medium">إجمالي المديرين</div>
            <div className="mt-3 text-xs text-[#635ca8]">
              {managers.length > 0 ? `معدل ${(branches.filter(b => managers.some(m => m.name === b.manager)).length / managers.length * 100).toFixed(0)}% مُعين` : 'لا يوجد مديرين'}
            </div>
          </div>

          <div className="bg-gradient-to-br from-white to-emerald-50/30 backdrop-blur-xl p-6 rounded-2xl border border-white/40 ring-1 ring-emerald-200/20">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <Badge className="bg-emerald-100 text-emerald-700 font-semibold">نشط</Badge>
            </div>
            <div className="text-3xl font-bold text-gray-800 mb-1">
              {branches.filter(b => managers.some(m => m.name === b.manager)).length}
            </div>
            <div className="text-sm text-gray-600 font-medium">الفروع المُدارة</div>
            <div className="mt-3 text-xs text-emerald-600">
              من أصل {branches.length} فرع
            </div>
          </div>

          <div className="bg-gradient-to-br from-white to-orange-50/30 backdrop-blur-xl p-6 rounded-2xl border border-white/40 ring-1 ring-orange-200/20">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl">
                <UserCheck className="w-6 h-6 text-white" />
              </div>
              <Badge className="bg-orange-100 text-orange-700 font-semibold">متاح</Badge>
            </div>
            <div className="text-3xl font-bold text-gray-800 mb-1">
              {managers.length - branches.filter(b => managers.some(m => m.name === b.manager)).length}
            </div>
            <div className="text-sm text-gray-600 font-medium">مديرين غير مُعينين</div>
            <div className="mt-3 text-xs text-orange-600">
              جاهزين للتعيين
            </div>
          </div>

          <div className="bg-gradient-to-br from-white to-purple-50/30 backdrop-blur-xl p-6 rounded-2xl border border-white/40 ring-1 ring-purple-200/20">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <Badge className="bg-purple-100 text-purple-700 font-semibold">منتظر</Badge>
            </div>
            <div className="text-3xl font-bold text-gray-800 mb-1">
              {branches.length - branches.filter(b => managers.some(m => m.name === b.manager)).length}
            </div>
            <div className="text-sm text-gray-600 font-medium">فروع بدون مدير</div>
            <div className="mt-3 text-xs text-purple-600">
              تحتاج تعيين مدير
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl border border-white/30 ring-1 ring-gray-200/20">
          {/* Search and Filter Section */}
          <div className="p-6 border-b border-gray-200/30">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    placeholder="البحث بالاسم، الهاتف، أو الإيميل..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pr-10 bg-gray-50/80 border-gray-200/50 focus:bg-white focus:ring-2 focus:ring-[#635ca8]/20 text-gray-800 placeholder-gray-500"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={filterStatus === 'all' ? 'default' : 'outline'}
                    onClick={() => setFilterStatus('all')}
                    className={`${filterStatus === 'all' ? 'bg-[#635ca8] text-white' : 'bg-white text-gray-700 hover:bg-gray-50'} transition-all duration-200`}
                  >
                    الكل
                  </Button>
                  <Button
                    variant={filterStatus === 'assigned' ? 'default' : 'outline'}
                    onClick={() => setFilterStatus('assigned')}
                    className={`${filterStatus === 'assigned' ? 'bg-emerald-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'} transition-all duration-200`}
                  >
                    مُعين
                  </Button>
                  <Button
                    variant={filterStatus === 'unassigned' ? 'default' : 'outline'}
                    onClick={() => setFilterStatus('unassigned')}
                    className={`${filterStatus === 'unassigned' ? 'bg-orange-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'} transition-all duration-200`}
                  >
                    غير مُعين
                  </Button>
                </div>
              </div>
              <div className="text-sm text-gray-500">
                عرض {filteredManagers.length} من أصل {managers.length} مدير
              </div>
            </div>
          </div>
          {showForm && (
            <div className="p-8 border-b border-gray-200/30 bg-gradient-to-r from-gray-50/50 to-[#635ca8]/10">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-[#635ca8]/10 rounded-lg">
                  <Users className="w-5 h-5 text-[#635ca8]" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800">{editId ? 'تعديل بيانات المدير' : 'إضافة مدير جديد'}</h3>
              </div>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-6 bg-white/80 backdrop-blur-sm p-8 rounded-2xl border border-gray-200/30">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <UserCheck className="w-4 h-4" />
                    الاسم الكامل
                  </Label>
                  <Input 
                    name="name" 
                    value={form.name} 
                    onChange={handleChange} 
                    required 
                    className="bg-gray-50/80 border-gray-200/50 focus:bg-white focus:ring-2 focus:ring-[#635ca8]/20 text-gray-800 text-lg py-3"
                    placeholder="أدخل الاسم الكامل"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <Phone className="w-4 h-4" />
                    رقم الجوال
                  </Label>
                  <Input 
                    name="phone" 
                    value={form.phone} 
                    onChange={handleChange} 
                    required 
                    inputMode="numeric" 
                    pattern="[0-9]*" 
                    className="bg-gray-50/80 border-gray-200/50 focus:bg-white focus:ring-2 focus:ring-[#635ca8]/20 text-gray-800 text-lg py-3"
                    placeholder="05xxxxxxxx"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <IdCard className="w-4 h-4" />
                    رقم الإقامة/الهوية
                  </Label>
                  <Input 
                    name="iqama" 
                    value={form.iqama} 
                    onChange={handleChange} 
                    required 
                    inputMode="numeric" 
                    pattern="[0-9]*" 
                    className="bg-gray-50/80 border-gray-200/50 focus:bg-white focus:ring-2 focus:ring-[#635ca8]/20 text-gray-800 text-lg py-3"
                    placeholder="1xxxxxxxxx"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <Mail className="w-4 h-4" />
                    البريد الإلكتروني
                  </Label>
                  <Input 
                    name="email" 
                    value={form.email} 
                    onChange={handleChange} 
                    required 
                    type="email" 
                    className="bg-gray-50/80 border-gray-200/50 focus:bg-white focus:ring-2 focus:ring-[#635ca8]/20 text-gray-800 text-lg py-3"
                    placeholder="manager@example.com"
                  />
                </div>
                
                <div className="lg:col-span-2 space-y-2">
                  <Label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <Eye className="w-4 h-4" />
                    كلمة المرور
                  </Label>
                  <div className="relative">
                    <Input 
                      name="password" 
                      value={form.password} 
                      onChange={handleChange} 
                      required 
                      type={showPassword ? "text" : "password"}
                      className="bg-gray-50/80 border-gray-200/50 focus:bg-white focus:ring-2 focus:ring-[#635ca8]/20 text-gray-800 text-lg py-3 pl-12"
                      placeholder="أدخل كلمة مرور قوية"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
                
                <div className="lg:col-span-2 flex gap-4 justify-end mt-6 pt-6 border-t border-gray-200/50">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => { setShowForm(false); setEditId(null); setShowPassword(false); }} 
                    className="bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100 transition-all duration-300 px-8 py-3"
                  >
                    إلغاء
                  </Button>
                  <Button 
                    type="submit" 
                    className="bg-gradient-to-r from-[#635ca8] to-[#635ca8]/80 hover:from-[#635ca8]/90 hover:to-[#635ca8] text-white ring-2 ring-[#635ca8]/30 transition-all duration-300 hover:scale-105 px-8 py-3 font-semibold"
                  >
                    {editId ? 'تحديث البيانات' : 'إضافة المدير'}
                  </Button>
                </div>
              </form>
            </div>
          )}
          
          <div className="p-6">
            {filteredManagers.length === 0 && !loading ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 mx-auto mb-4 p-6 bg-gray-100 rounded-full">
                  <Users className="w-full h-full text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  {searchTerm || filterStatus !== 'all' ? 'لا توجد نتائج' : 'لا يوجد مديرين'}
                </h3>
                <p className="text-gray-500 mb-6">
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
                    className="bg-[#635ca8] hover:bg-[#635ca8]/90 text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    إضافة أول مدير
                  </Button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white/90 rounded-2xl ring-1 ring-gray-200/30 backdrop-blur-sm">
                  <thead>
                    <tr className="bg-gradient-to-r from-gray-50/90 to-[#635ca8]/10 border-b border-gray-200/30">
                      <th className="py-5 px-6 text-right text-sm font-bold text-gray-800">المدير</th>
                      <th className="py-5 px-6 text-right text-sm font-bold text-gray-800">معلومات الاتصال</th>
                      <th className="py-5 px-6 text-center text-sm font-bold text-gray-800">الفرع المُعين</th>
                      <th className="py-5 px-6 text-center text-sm font-bold text-gray-800">الحالة</th>
                      <th className="py-5 px-6 text-center text-sm font-bold text-gray-800">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100/50">
                    {loading ? (
                      <tr>
                        <td colSpan={5} className="text-center py-12">
                          <ProfessionalLoader 
                            message="جاري تحميل بيانات المديرين..." 
                            variant="purple" 
                            size="md" 
                          />
                        </td>
                      </tr>
                    ) : filteredManagers.map((manager) => {
                      const branch = branches.find(b => b.manager === manager.name);
                      return (
                        <tr key={manager.id} className="hover:bg-[#635ca8]/10 transition-all duration-200 group">
                          <td className="py-6 px-6">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-gradient-to-br from-[#635ca8] to-[#635ca8]/80 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                                {manager.name.charAt(0)}
                              </div>
                              <div>
                                <div className="font-semibold text-gray-800 text-lg">{manager.name}</div>
                                <div className="text-sm text-gray-500 flex items-center gap-1">
                                  <IdCard className="w-3 h-3" />
                                  {manager.iqama}
                                </div>
                              </div>
                            </div>
                          </td>
                          
                          <td className="py-6 px-6">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-gray-700">
                                <Phone className="w-4 h-4 text-gray-400" />
                                <span className="font-medium">{manager.phone}</span>
                              </div>
                              <div className="flex items-center gap-2 text-gray-600">
                                <Mail className="w-4 h-4 text-gray-400" />
                                <span className="text-sm">{manager.email}</span>
                              </div>
                            </div>
                          </td>
                          
                          <td className="py-6 px-6 text-center">
                            {branch ? (
                              <div className="flex flex-col items-center gap-2">
                                <Badge className="bg-emerald-100 text-emerald-800 px-3 py-1 font-semibold">
                                  <Building2 className="w-3 h-3 mr-1" />
                                  {branch.name}
                                </Badge>
                                <span className="text-xs text-emerald-600">مُعين ونشط</span>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center gap-2">
                                <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 px-3 py-1 font-semibold">
                                  غير مُعين
                                </Badge>
                                <span className="text-xs text-orange-600">متاح للتعيين</span>
                              </div>
                            )}
                          </td>
                          
                          <td className="py-6 px-6 text-center">
                            <Badge 
                              className={`${
                                branch 
                                  ? 'bg-green-100 text-green-800 border-green-200' 
                                  : 'bg-yellow-100 text-yellow-800 border-yellow-200'
                              } font-semibold`}
                              variant="outline"
                            >
                              {branch ? '✓ نشط' : '⏳ في الانتظار'}
                            </Badge>
                          </td>
                          
                          <td className="py-6 px-6">
                            <div className="flex items-center justify-center gap-2">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="text-[#635ca8] hover:bg-[#635ca8]/10 hover:text-[#635ca8] transition-all duration-200 rounded-lg p-2" 
                                onClick={() => handleEdit(manager)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="text-red-600 hover:bg-red-50 hover:text-red-700 transition-all duration-200 rounded-lg p-2" 
                                onClick={() => handleDelete(manager.id!)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Managers;
