import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen,
  ChevronRight,
  ChevronDown,
  Plus,
  Edit,
  Trash2,
  Building,
  Folder,
  File,
  Save,
  X,
  Loader2
} from 'lucide-react';
import { getAccounts, addAccount, type Account } from '@/lib/accountsService';
import { toast } from 'sonner';

const ChartOfAccountsPage: React.FC = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Load accounts from Firebase
  const loadAccounts = async () => {
    try {
      setIsLoading(true);
      console.log('Loading accounts from Firebase...');
      const firebaseAccounts = await getAccounts();
      console.log('Accounts loaded:', firebaseAccounts);
      
      // Build hierarchical structure
      const hierarchicalAccounts = buildAccountHierarchy(firebaseAccounts);
      setAccounts(hierarchicalAccounts);
      
      if (firebaseAccounts.length === 0) {
        toast.info('لا توجد حسابات في قاعدة البيانات. يمكنك إضافة حسابات جديدة.');
      } else {
        toast.success(`تم تحميل ${firebaseAccounts.length} حساب من قاعدة البيانات`);
      }
    } catch (error) {
      console.error('Error loading accounts:', error);
      toast.error(`فشل في تحميل الحسابات: ${error.message || 'خطأ غير معروف'}`);
      setAccounts([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Get the root account (level 1) for determining classification
  const getRootAccount = (account: Account, allAccounts: Account[]): Account => {
    if (account.level === 1 || !account.parentId) {
      return account;
    }
    
    // Find parent and recursively get root
    const flatAccounts = flattenAccountHierarchy(allAccounts);
    const parent = flatAccounts.find(acc => acc.id === account.parentId);
    if (parent) {
      return getRootAccount(parent, allAccounts);
    }
    
    return account; // fallback
  };

  // Flatten hierarchical accounts to flat array
  const flattenAccountHierarchy = (hierarchicalAccounts: Account[]): Account[] => {
    const result: Account[] = [];
    
    const flatten = (accounts: Account[]) => {
      accounts.forEach(account => {
        result.push(account);
        if (account.children) {
          flatten(account.children);
        }
      });
    };
    
    flatten(hierarchicalAccounts);
    return result;
  };
  const buildAccountHierarchy = (flatAccounts: Account[]): Account[] => {
    const accountMap = new Map<string, Account>();
    const rootAccounts: Account[] = [];
    
    // First pass: create map of all accounts
    flatAccounts.forEach(account => {
      accountMap.set(account.id, { ...account, children: [] });
    });
    
    // Second pass: build hierarchy and update hasSubAccounts
    flatAccounts.forEach(account => {
      const accountWithChildren = accountMap.get(account.id)!;
      if (account.parentId && accountMap.has(account.parentId)) {
        const parent = accountMap.get(account.parentId)!;
        if (!parent.children) parent.children = [];
        parent.children.push(accountWithChildren);
        // تحديث hasSubAccounts للحساب الأب
        parent.hasSubAccounts = true;
      } else {
        rootAccounts.push(accountWithChildren);
      }
    });
    
    return rootAccounts;
  };

  // Load accounts on component mount
  useEffect(() => {
    loadAccounts();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAccount, setNewAccount] = useState<Partial<Account>>({
    nameAr: '',
    nameEn: '',
    classification: 'الأصول',
    status: 'نشط',
    isClosed: false,
    hasSubAccounts: false,
    level: 1
  });

  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['1', '11', '2']));
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Account>>({});

  // جلب التصنيفات من الملف الخارجي

  const costCenters = [
    'مركز التكلفة الرئيسي',
    'مركز التكلفة الإداري',
    'مركز التكلفة المالي',
    'مركز التكلفة التشغيلي'
  ];

  // إنشاء كود تلقائي للحسابات الفرعية
  const generateSubAccountCode = async (parentCode: string): Promise<string> => {
    try {
      // الحصول على جميع الحسابات من قاعدة البيانات لضمان البحث الدقيق
      const allAccounts = await getAccounts();
      
      // البحث عن الحسابات الفرعية للحساب الجذر
      const subAccounts = allAccounts.filter(account => 
        account.code.startsWith(parentCode) && 
        account.code !== parentCode &&
        account.code.length === parentCode.length + 2 // فقط المستوى المباشر
      );
      
      if (subAccounts.length === 0) {
        return parentCode + '01'; // أول حساب فرعي
      }
      
      // العثور على أعلى رقم فرعي
      const subCodes = subAccounts
        .map(account => account.code.substring(parentCode.length))
        .map(suffix => parseInt(suffix))
        .filter(num => !isNaN(num))
        .sort((a, b) => b - a);
      
      if (subCodes.length === 0) {
        return parentCode + '01';
      }
      
      const nextSubCode = subCodes[0] + 1;
      return parentCode + nextSubCode.toString().padStart(2, '0');
    } catch (error) {
      console.error('Error generating sub account code:', error);
      return parentCode + '01';
    }
  };

  // إنشاء كود تلقائي للحسابات الرئيسية  
  const generateMainAccountCode = async (): Promise<string> => {
    try {
      // الحصول على جميع الحسابات من قاعدة البيانات
      const allAccounts = await getAccounts();
      const level1Accounts = allAccounts.filter(account => account.level === 1);
      
      if (level1Accounts.length === 0) {
        return '1000';
      }
      
      const codes = level1Accounts
        .map(account => parseInt(account.code))
        .filter(code => !isNaN(code))
        .sort((a, b) => b - a);
      
      if (codes.length === 0) {
        return '1000';
      }
      
      const nextCode = codes[0] + 1;
      return nextCode.toString();
    } catch (error) {
      console.error('Error generating main account code:', error);
      return '1000';
    }
  };

  const toggleNode = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const handleAccountSelect = (account: Account) => {
    setSelectedAccount(account);
    setIsEditing(false);
    setEditForm(account);
  };


  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleAddClick = () => {
    setShowAddForm(true);
    
    // إذا كان هناك حساب محدد، اجعل الحساب الجديد فرعي منه
    if (selectedAccount) {
      // الحصول على الحساب الجذر (المستوى الأول) لتحديد التصنيف
      const rootAccount = getRootAccount(selectedAccount, accounts);
      
      setNewAccount({
        nameAr: '',
        nameEn: '',
        classification: rootAccount.nameAr, // استخدم اسم الحساب الجذر كتصنيف
        status: 'نشط',
        isClosed: false,
        hasSubAccounts: false,
        level: (selectedAccount.level || 1) + 1,
        parentId: selectedAccount.id
      });
    } else {
      setNewAccount({
        nameAr: '',
        nameEn: '',
        classification: '', // سيتم تحديده عند كتابة اسم الحساب
        status: 'نشط',
        isClosed: false,
        hasSubAccounts: false,
        level: 1
      });
    }
  };

  const handleAddAccount = async () => {
    if (!newAccount.nameAr || !newAccount.nameEn) return;
    
    try {
      // إنشاء كود تلقائي
      let autoCode: string;
      if (newAccount.parentId && selectedAccount) {
        // كود للحساب الفرعي - استخدم كود الحساب الأب
        autoCode = await generateSubAccountCode(selectedAccount.code);
      } else {
        // كود للحساب الرئيسي
        autoCode = await generateMainAccountCode();
      }
      
      const accountToAdd: Omit<Account, 'id'> = {
        code: autoCode,
        nameAr: newAccount.nameAr!,
        nameEn: newAccount.nameEn!,
        // للحسابات الرئيسية: التصنيف = اسم الحساب، للفرعية: التصنيف من الحساب الجذر
        classification: newAccount.level === 1 ? newAccount.nameAr! : newAccount.classification!,
        balance: 0,
        level: newAccount.level || 1,
        status: 'نشط',
        isClosed: false,
        hasSubAccounts: false,
        nature: 'مدينة',
        ...(newAccount.parentId && { parentId: newAccount.parentId })
      };
      
      await addAccount(accountToAdd);
      
      // إذا تم إضافة حساب فرعي، قم بتحديث الحساب الأب ليصبح له حسابات فرعية
      if (newAccount.parentId && selectedAccount) {
        // في التطبيق الحقيقي، يجب تحديث hasSubAccounts في قاعدة البيانات
        // ولكن هنا سنعيد تحميل البيانات لضمان التحديث الصحيح
        toast.success(`تم إضافة الحساب الفرعي بنجاح تحت ${selectedAccount.nameAr} بالكود ${autoCode}`);
      } else {
        toast.success(`تم إضافة الحساب الرئيسي بنجاح بالكود ${autoCode}`);
      }
      
      setShowAddForm(false);
      await loadAccounts(); // Reload accounts
      
      // توسيع العقدة الأب إذا كان الحساب المضاف فرعي
      if (newAccount.parentId) {
        setExpandedNodes(prev => new Set([...prev, newAccount.parentId!]));
      }
    } catch (error) {
      console.error('Error adding account:', error);
      toast.error(`فشل في إضافة الحساب: ${error.message || 'خطأ غير معروف'}`);
    }
  };

  const handleCancelAdd = () => {
    setShowAddForm(false);
  };

  const handleSave = () => {
    // للحسابات الرئيسية: التصنيف = اسم الحساب
    if (selectedAccount && selectedAccount.level === 1) {
      editForm.classification = editForm.nameAr;
    }
    
    // Here you would implement the save logic
    console.log('Saving account:', editForm);
    setIsEditing(false);
    setSelectedAccount(editForm as Account);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditForm(selectedAccount || {});
  };

const renderAccountTree = (accountList: Account[], level = 0) => {
  return accountList.map((account, idx) => {
    const isLast = idx === accountList.length - 1;
    return (
      <div key={account.id} className="select-none relative">
        {/* خطوط طولية */}
        {level > 0 && (
          <div
            className="absolute top-0 right-0"
            style={{
              width: '20px',
              right: `${(level - 1) * 20 + 2}px`,
              height: isLast ? '36px' : '100%',
              borderRight: isLast ? '2px solid transparent' : '2px solid #e5e7eb',
              zIndex: 0,
            }}
          />
        )}
        <div
          className={`flex items-center py-2 px-2 hover:bg-gray-50 cursor-pointer rounded ${
            selectedAccount?.id === account.id ? 'bg-blue-50 border-r-4 border-blue-500' : ''
          }`}
          style={{ paddingRight: `${level * 20 + 8}px`, position: 'relative', zIndex: 1 }}
          onClick={() => handleAccountSelect(account)}
        >
          <div className="flex items-center flex-1">
            {(account.children && account.children.length > 0) || account.hasSubAccounts ? (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 mr-2 font-bold text-lg bg-gray-200 hover:bg-gray-300 rounded-full transition-colors duration-150"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleNode(account.id);
                }}
                aria-label={expandedNodes.has(account.id) ? 'Collapse' : 'Expand'}
              >
                {expandedNodes.has(account.id) ? '-' : '+'}
              </Button>
            ) : (
              <div className="w-6 mr-2" />
            )}
            <div className="flex items-center">
              {(account.children && account.children.length > 0) || account.hasSubAccounts ? (
                <Folder className="h-4 w-4 text-yellow-600 mr-2" />
              ) : (
                <File className="h-4 w-4 text-blue-600 mr-2" />
              )}
              <span className="text-sm font-medium">{account.code}</span>
              <span className="text-sm text-gray-600 mr-2">-</span>
              <span className="text-sm">{account.nameAr}</span>
              {/* عرض التصنيف للحسابات الرئيسية فقط */}
              {account.level === 1 && (
                <Badge 
                  variant="outline" 
                  className="mr-2 text-xs"
                  style={{
                    backgroundColor: '#e3f2fd',
                    color: '#1565c0',
                    borderColor: '#90caf9'
                  }}
                >
                  {account.nameAr} {/* اسم الحساب هو التصنيف */}
                </Badge>
              )}
            </div>
          </div>
        </div>
        {account.children && expandedNodes.has(account.id) && (
          <div>{renderAccountTree(account.children, level + 1)}</div>
        )}
      </div>
    );
  });
};

  return (
    <div className="w-full p-6 space-y-6 min-h-screen" dir="rtl">
      {/* Header */}
      <div className="p-4 font-['Tajawal'] bg-white mb-4 rounded-lg shadow-[0_0_10px_rgba(0,0,0,0.1)] relative overflow-hidden">
        <div className="flex items-center">
          <BookOpen className="h-8 w-8 text-green-600 ml-3" />
          <h1 className="text-2xl font-bold text-gray-800">دليل الحسابات</h1>
        </div>
        <p className="text-gray-600 mt-2">عرض وإدارة دليل الحسابات الكامل</p>
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-blue-500"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Account Tree - Right Side */}
        <div className="lg:col-span-1">
          <Card className="h-[700px]">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>شجرة الحسابات</span>
                <Button 
                  size="sm" 
                  className="h-8 bg-blue-500 hover:bg-blue-600 text-white" 
                  onClick={handleAddClick}
                  disabled={isLoading}
                  title={selectedAccount ? `إضافة حساب فرعي تحت: ${selectedAccount.nameAr}` : 'إضافة حساب رئيسي جديد'}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  {selectedAccount ? 'إضافة فرعي' : 'إضافة'}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-auto h-[600px] p-4">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center h-full">
                    <Loader2 className="h-8 w-8 text-blue-600 animate-spin mb-2" />
                    <p className="text-gray-500">جاري تحميل الحسابات...</p>
                  </div>
                ) : accounts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <BookOpen className="h-16 w-16 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد حسابات</h3>
                    <p className="text-gray-500 mb-4">ابدأ بإضافة حسابات جديدة</p>
                    <Button size="sm" className="bg-blue-500 hover:bg-blue-600 text-white" onClick={handleAddClick}>
                      <Plus className="h-4 w-4 mr-1" />
                      إضافة أول حساب
                    </Button>
                  </div>
                ) : (
                  renderAccountTree(accounts)
                )}
                {showAddForm && (
                  <div className="mt-4 p-4 bg-gray-50 border rounded space-y-3">
                    {selectedAccount && (
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg mb-3">
                        <div className="text-sm text-blue-800 font-medium mb-1">
                          إضافة حساب فرعي تحت:
                        </div>
                        <div className="text-sm text-blue-700">
                          {selectedAccount.code} - {selectedAccount.nameAr}
                        </div>
                        <div className="text-xs text-blue-600 mt-1">
                          المستوى: {(selectedAccount.level || 1) + 1}
                        </div>
                        {selectedAccount.level !== 1 && (
                          <div className="text-xs text-blue-600 mt-1">
                            التصنيف: {getRootAccount(selectedAccount, accounts).nameAr} (موروث من الحساب الرئيسي)
                          </div>
                        )}
                      </div>
                    )}
                    <div className="grid grid-cols-1 gap-2">
                      <Input 
                        placeholder="اسم الحساب (عربي)" 
                        value={newAccount.nameAr} 
                        onChange={e => setNewAccount({
                          ...newAccount, 
                          nameAr: e.target.value,
                          // للحسابات الرئيسية: التصنيف = اسم الحساب
                          ...(newAccount.level === 1 && { classification: e.target.value })
                        })} 
                      />
                      <Input 
                        placeholder="اسم الحساب (إنجليزي)" 
                        value={newAccount.nameEn} 
                        onChange={e => setNewAccount({...newAccount, nameEn: e.target.value})} 
                      />
                      {/* إزالة اختيار التصنيف - سيتم تحديده تلقائياً */}
                      {!selectedAccount && newAccount.level === 1 && (
                        <div className="p-2 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
                          💡 التصنيف سيكون نفس اسم الحساب العربي، والكود سيتم إنشاؤه تلقائياً
                        </div>
                      )}
                      {selectedAccount && (
                        <div className="p-2 bg-green-50 border border-green-200 rounded text-sm text-green-800">
                          💡 سيتم إنشاء كود الحساب الفرعي تلقائياً بناءً على كود الحساب الأب: {selectedAccount.code}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button size="sm" className="bg-green-500 hover:bg-green-600 text-white" onClick={handleAddAccount}>
                        {selectedAccount ? 'إضافة حساب فرعي' : 'إضافة حساب رئيسي'}
                      </Button>
                      <Button size="sm" variant="outline" onClick={handleCancelAdd}>إلغاء</Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Account Details - Left Side */}
<div className="lg:col-span-2">
  <Card className="h-[700px]">
    <CardHeader>
      <CardTitle className="flex items-center justify-between">
        <span>تفاصيل الحساب</span>
        {selectedAccount && (
          <div className="flex gap-2">
            {!isEditing ? (
              <Button 
                size="sm" 
                onClick={handleEdit} 
                className="h-8 bg-blue-500 hover:bg-blue-600 text-white"
              >
                <Edit className="h-4 w-4 mr-1" />
                تعديل
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button size="sm" onClick={handleSave} className="h-8">
                  <Save className="h-4 w-4 mr-1" />
                  حفظ
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={handleCancel} 
                  className="h-8"
                >
                  <X className="h-4 w-4 mr-1" />
                  إلغاء
                </Button>
              </div>
            )}
          </div>
        )}
      </CardTitle>
    </CardHeader>
    
    <CardContent className="space-y-4 overflow-auto h-[600px]">
      {selectedAccount ? (
        <div className="space-y-6">
          {/* الصف الأول: 3 أعمدة */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* تصنيف الحساب */}
            <div className="space-y-2">
              <Label>تصنيف الحساب</Label>
              {isEditing && selectedAccount.level === 1 ? (
                <div className="space-y-2">
                  <div className="p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
                    💡 التصنيف للحساب الرئيسي هو اسم الحساب نفسه
                  </div>
                  <Input
                    value={editForm.nameAr || ''}
                    onChange={(e) => {
                      setEditForm({
                        ...editForm, 
                        nameAr: e.target.value,
                        classification: e.target.value // التصنيف = اسم الحساب
                      });
                    }}
                    placeholder="اسم الحساب (والذي سيكون التصنيف)"
                    className="text-right"
                  />
                </div>
              ) : (
                <div className="p-2 bg-gray-50 rounded border">
                  <Badge variant="outline">
                    {selectedAccount.level === 1 
                      ? selectedAccount.nameAr // اسم الحساب الرئيسي هو التصنيف
                      : getRootAccount(selectedAccount, accounts).nameAr // اسم الحساب الجذر
                    }
                  </Badge>
                  {selectedAccount.level !== 1 && (
                    <div className="text-xs text-gray-500 mt-1">
                      (موروث من الحساب الرئيسي: {getRootAccount(selectedAccount, accounts).nameAr})
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* الحساب الأب */}
            <div className="space-y-2">
              <Label>الحساب الأب</Label>
              <div className="p-2 bg-gray-50 rounded border">
                {selectedAccount.parentId ? (
                  <span className="text-sm">
                    {accounts.find(acc => acc.id === selectedAccount.parentId)?.nameAr || 'غير محدد'}
                  </span>
                ) : (
                  <span className="text-sm text-gray-500">حساب رئيسي</span>
                )}
              </div>
            </div>

            {/* مستوى الحساب */}
            <div className="space-y-2">
              <Label>المستوى</Label>
              <div className="p-2 bg-gray-50 rounded border">
                <Badge variant="outline">المستوى {selectedAccount.level}</Badge>
              </div>
            </div>
          </div>

          {/* الصف الثاني: 3 أعمدة */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* رقم الحساب */}
            <div className="space-y-2">
              <Label>رقم الحساب</Label>
              {isEditing ? (
                <Input
                  value={editForm.code || ''}
                  onChange={(e) => setEditForm({...editForm, code: e.target.value})}
                  className="text-right"
                  dir="ltr"
                />
              ) : (
                <div className="p-2 bg-gray-50 rounded border font-mono">
                  {selectedAccount.code}
                </div>
              )}
            </div>

            {/* اسم الحساب (عربي) */}
            <div className="space-y-2">
              <Label>اسم الحساب (عربي)</Label>
              {isEditing ? (
                <Input
                  value={editForm.nameAr || ''}
                  onChange={(e) => setEditForm({...editForm, nameAr: e.target.value})}
                  className="text-right"
                />
              ) : (
                <div className="p-2 bg-gray-50 rounded border">
                  {selectedAccount.nameAr}
                </div>
              )}
            </div>

            {/* اسم الحساب (إنجليزي) */}
            <div className="space-y-2">
              <Label>اسم الحساب (إنجليزي)</Label>
              {isEditing ? (
                <Input
                  value={editForm.nameEn || ''}
                  onChange={(e) => setEditForm({...editForm, nameEn: e.target.value})}
                  className="text-left"
                  dir="ltr"
                />
              ) : (
                <div className="p-2 bg-gray-50 rounded border text-left" dir="ltr">
                  {selectedAccount.nameEn}
                </div>
              )}
            </div>
          </div>

          {/* الصف الثالث: 3 أعمدة */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* مركز التكلفة */}
            <div className="space-y-2">
              <Label>مركز التكلفة</Label>
              {isEditing ? (
                <Select 
                  value={editForm.costCenter} 
                  onValueChange={(value) => setEditForm({...editForm, costCenter: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر مركز التكلفة" />
                  </SelectTrigger>
                  <SelectContent>
                    {costCenters.map((center) => (
                      <SelectItem key={center} value={center}>
                        {center}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="p-2 bg-gray-50 rounded border">
                  {selectedAccount.costCenter || 'غير محدد'}
                </div>
              )}
            </div>

            {/* حالة الحساب */}
            <div className="space-y-2">
              <Label>حالة الحساب</Label>
              {isEditing ? (
                <Select 
                  value={editForm.status} 
                  onValueChange={(value: 'نشط' | 'غير نشط') => 
                    setEditForm({...editForm, status: value})
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="نشط">نشط</SelectItem>
                    <SelectItem value="غير نشط">غير نشط</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <div className="p-2 bg-gray-50 rounded border">
                  <Badge variant={selectedAccount.status === 'نشط' ? 'default' : 'secondary'}>
                    {selectedAccount.status}
                  </Badge>
                </div>
              )}
            </div>

            {/* حالة الإقفال */}
            <div className="space-y-2">
              <Label>الإقفال</Label>
              {isEditing ? (
                <div className="flex items-center space-x-2 space-x-reverse p-2">
                  <Checkbox
                    id="closed"
                    checked={editForm.isClosed || false}
                    onCheckedChange={(checked) => 
                      setEditForm({...editForm, isClosed: checked as boolean})
                    }
                  />
                  <Label htmlFor="closed">مقفل</Label>
                </div>
              ) : (
                <div className="p-2 bg-gray-50 rounded border">
                  <Badge variant={selectedAccount.isClosed ? 'destructive' : 'default'}>
                    {selectedAccount.isClosed ? 'مقفل' : 'مفتوح'}
                  </Badge>
                </div>
              )}
            </div>
          </div>

          {/* الصف الرابع: له حسابات تحليلية (مركز) */}
          <div className="flex justify-center">
            <div className="w-full max-w-sm space-y-2">
              <Label>له حسابات تحليلية</Label>
              {isEditing ? (
                <div className="flex items-center justify-center space-x-2 space-x-reverse p-2">
                  <Checkbox
                    id="hasSubAccounts"
                    checked={editForm.hasSubAccounts || false}
                    onCheckedChange={(checked) => 
                      setEditForm({...editForm, hasSubAccounts: checked as boolean})
                    }
                  />
                  <Label htmlFor="hasSubAccounts">له حسابات فرعية</Label>
                </div>
              ) : (
                <div className="p-2 bg-gray-50 rounded border text-center">
                  <Badge variant={selectedAccount.hasSubAccounts ? 'default' : 'outline'}>
                    {selectedAccount.hasSubAccounts ? 'نعم' : 'لا'}
                  </Badge>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-full text-center">
          <Building className="h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">اختر حساباً من الشجرة</h3>
          <p className="text-gray-500">قم بالنقر على أي حساب من الشجرة لعرض تفاصيله</p>
        </div>
      )}
    </CardContent>
  </Card>
</div>
      </div>
    </div>
  );
}

export default ChartOfAccountsPage;
