import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input as AntdInput, Select, Checkbox as AntdCheckbox, DatePicker } from 'antd';
import dayjs from 'dayjs';
import type { BadgeProps } from "@/components/ui/badge";
import { Badge } from '@/components/ui/badge';
import type { SelectProps } from 'antd';
import Breadcrumb from '../../components/Breadcrumb';
import { fetchBranches, type Branch } from '@/utils/branches';

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
  Loader2,
  RefreshCw,
  Link
} from 'lucide-react';
import { getAccounts, addAccount, updateAccount, deleteAccount, type Account } from '@/services/accountsService';
import { toast } from 'sonner';
import { useCallback } from 'react';

// دالة تحويل النصوص العربية إلى إنجليزية
const arabicToEnglish = (text: string) => {
  const namesMap: Record<string, string> = {
    'محمد': 'mohammed', 'محمود': 'mahmoud', 'أحمد': 'ahmed', 'مصطفى': 'mostafa',
    'علي': 'ali', 'حسن': 'hassan', 'حسين': 'hussein', 'ابراهيم': 'ibrahim',
    'يوسف': 'youssef', 'سعيد': 'saeed', 'عبدالله': 'abdullah', 'عبد الله': 'abdullah',
    'خالد': 'khaled', 'سارة': 'sarah', 'فاطمة': 'fatima', 'ياسين': 'yassin',
    'ياسر': 'yasser', 'رشاد': 'rashad', 'سامي': 'sami', 'سلمى': 'salma',
    'نور': 'noor', 'منى': 'mona', 'مريم': 'maryam', 'عمر': 'omar',
    'طارق': 'tarek', 'شريف': 'sherif', 'شيماء': 'shaimaa', 'جميلة': 'jamila',
    'سعد': 'saad', 'عبده': 'abdou',
  };

  let result = text.replace(/[\u064B-\u0652]/g, '');
  
  Object.keys(namesMap).forEach(arabicName => {
    const regex = new RegExp(arabicName, 'g');
    result = result.replace(regex, namesMap[arabicName]);
  });

  result = result
    .replace(/تش/g, 'ch').replace(/ث/g, 'th').replace(/خ/g, 'kh')
    .replace(/ذ/g, 'dh').replace(/ش/g, 'sh').replace(/غ/g, 'gh')
    .replace(/ظ/g, 'z').replace(/ق/g, 'q').replace(/ص/g, 's')
    .replace(/ض/g, 'd').replace(/ط/g, 't').replace(/ع/g, 'a')
    .replace(/ء/g, '').replace(/ؤ/g, 'w').replace(/ئ/g, 'y')
    .replace(/ى/g, 'a').replace(/ة/g, 'a').replace(/ﻻ/g, 'la');

  const map: Record<string, string> = {
    'ا': 'a', 'أ': 'a', 'إ': 'i', 'آ': 'a', 'ب': 'b', 'ت': 't',
    'ج': 'j', 'ح': 'h', 'د': 'd', 'ر': 'r', 'ز': 'z',
    'س': 's', 'ف': 'f', 'ك': 'k', 'ل': 'l', 'م': 'm', 'ن': 'n',
    'ه': 'h', 'و': 'w', 'ي': 'y', ' ': ' '
  };

  result = result.split('').map(c => map[c] || c).join('');
  return result.replace(/\s+/g, ' ').trim();
};

const ChartOfAccountsPage: React.FC = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [branches, setBranches] = useState<Branch[]>([]);
  
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
    
    // ترتيب الحسابات الجذر حسب الكود من الصغير إلى الكبير
    rootAccounts.sort((a, b) => {
      const codeA = parseInt(a.code) || 0;
      const codeB = parseInt(b.code) || 0;
      return codeA - codeB;
    });
    
    // ترتيب الحسابات الفرعية بالشكل التكراري
    const sortChildren = (accounts: Account[]) => {
      accounts.forEach(account => {
        if (account.children && account.children.length > 0) {
          account.children.sort((a, b) => {
            const codeA = parseInt(a.code) || 0;
            const codeB = parseInt(b.code) || 0;
            return codeA - codeB;
          });
          sortChildren(account.children);
        }
      });
    };
    
    sortChildren(rootAccounts);
    
    return rootAccounts;
  };

  // Load accounts on component mount
  useEffect(() => {
    const initializeData = async () => {
      try {
        setIsLoading(true);
        await Promise.all([
          loadAccounts(),
          loadBranches()
        ]);
      } catch (error) {
        console.error('Error initializing data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAccount, setNewAccount] = useState<Partial<Account>>({
    nameAr: '',
    nameEn: '',
    classification: 'الأصول',
    status: 'نشط',
    isClosed: false,
    hasSubAccounts: false,
    level: 1,
    linkedToPage: undefined,
    customerData: undefined,
    supplierData: undefined,
    cashboxData: undefined,
    bankData: undefined
  });

  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['1', '11', '2']));
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Account>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteWarning, setShowDeleteWarning] = useState(false);

  // جلب التصنيفات من الملف الخارجي

  const costCenters = [
    'مركز التكلفة الرئيسي',
    'مركز التكلفة الإداري',
    'مركز التكلفة المالي',
    'مركز التكلفة التشغيلي'
  ];

  // تحميل الفروع من قاعدة البيانات
  const loadBranches = async () => {
    try {
      const branchesData = await fetchBranches();
      setBranches(branchesData);
    } catch (error) {
      console.error('Error loading branches:', error);
      // في حالة الفشل، استخدم قائمة افتراضية
      setBranches([
        { code: 'MAIN', name: 'الفرع الرئيسي', address: '', taxFile: '', commercialReg: '', postalCode: '', poBox: '', manager: '' }
      ]);
    }
  };

  // إنشاء كود تلقائي للحسابات الفرعية
  const generateSubAccountCode = async (parentCode: string): Promise<string> => {
    try {
      // الحصول على جميع الحسابات من قاعدة البيانات لضمان البحث الدقيق
      const allAccounts = await getAccounts();
      
      // البحث عن الحسابات الفرعية للحساب الجذر
      const subAccounts = allAccounts.filter(account => 
        account.code.startsWith(parentCode) && 
        account.code !== parentCode &&
        account.code.length === parentCode.length + 1 // فقط المستوى المباشر (رقم واحد إضافي)
      );
      
      if (subAccounts.length === 0) {
        return parentCode + '1'; // أول حساب فرعي
      }
      
      // العثور على جميع الأرقام الفرعية المستخدمة
      const subCodes = subAccounts
        .map(account => account.code.substring(parentCode.length))
        .map(suffix => parseInt(suffix))
        .filter(num => !isNaN(num))
        .sort((a, b) => a - b); // ترتيب تصاعدي
      
      if (subCodes.length === 0) {
        return parentCode + '1';
      }
      
      // البحث عن أول رقم متاح في التسلسل
      let nextSubCode = 1;
      for (const code of subCodes) {
        if (code === nextSubCode) {
          nextSubCode++;
        } else {
          break;
        }
      }
      
      return parentCode + nextSubCode.toString();
    } catch (error) {
      console.error('Error generating sub account code:', error);
      return parentCode + '1';
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
      
      // الحصول على جميع الأكواد الموجودة وتحويلها لأرقام
      const codes = level1Accounts
        .map(account => parseInt(account.code))
        .filter(code => !isNaN(code))
        .sort((a, b) => a - b); // ترتيب تصاعدي
      
      if (codes.length === 0) {
        return '1000';
      }
      
      // البحث عن أول فجوة في التسلسل أو إضافة رقم جديد
      let nextCode = 1000;
      for (const code of codes) {
        if (code === nextCode) {
          nextCode += 1000;
        } else {
          break;
        }
      }
      
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
    setShowDeleteWarning(false);
  };


  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleDelete = async () => {
    if (!selectedAccount) return;
    
    // التحقق من وجود حسابات فرعية
    const flatAccounts = flattenAccountHierarchy(accounts);
    const subAccounts = flatAccounts.filter(account => account.parentId === selectedAccount.id);
    const hasSubAccounts = subAccounts.length > 0;
    
    if (hasSubAccounts) {
      // إظهار رسالة التحذير في الواجهة
      setShowDeleteWarning(true);
      
      // إنشاء رسالة مفصلة تتضمن أسماء الحسابات الفرعية
      let errorMessage = `🚫 تحذير: لا يمكن حذف هذا الحساب لأنه يحتوي على ${subAccounts.length} حساب فرعي.\n\n`;
      
      if (subAccounts.length <= 3) {
        // عرض أسماء الحسابات إذا كان عددها قليل
        errorMessage += `الحسابات الفرعية:\n`;
        subAccounts.forEach(subAccount => {
          errorMessage += `• ${subAccount.code} - ${subAccount.nameAr}\n`;
        });
        errorMessage += `\n`;
      } else {
        // عرض عدد الحسابات فقط إذا كان كبير
        errorMessage += `راجع تفاصيل الحساب لمشاهدة قائمة الحسابات الفرعية.\n\n`;
      }
      
      errorMessage += `يجب حذف جميع الحسابات الفرعية أولاً قبل حذف هذا الحساب.`;
      
      toast.error(errorMessage, {
        duration: 8000,
        style: {
          background: '#fef2f2',
          border: '1px solid #fecaca',
          color: '#991b1b',
          whiteSpace: 'pre-line',
          maxWidth: '500px',
        },
      });
      return;
    }
    
    // تأكيد الحذف
    let confirmMessage = `هل أنت متأكد من حذف الحساب "${selectedAccount.nameAr}" (${selectedAccount.code})؟\n\nهذا الإجراء لا يمكن التراجع عنه.`;
    
    // إضافة تحذير إضافي إذا كان الحساب مربوط بصفحة
    if (selectedAccount.linkedToPage) {
      const pageNames = {
        'customers': 'العملاء',
        'suppliers': 'الموردين', 
        'cashboxes': 'الصناديق',
        'banks': 'البنوك'
      };
      confirmMessage += `\n\n⚠️ تحذير: هذا الحساب مربوط بصفحة ${pageNames[selectedAccount.linkedToPage]}.\nسيتم أيضاً حذف البيانات المرتبطة من تلك الصفحة.`;
    }
    
    const confirmDelete = window.confirm(confirmMessage);
    
    if (!confirmDelete) return;
    
    try {
      // حذف البيانات من الصفحة المربوطة أولاً (إن وجدت)
      if (selectedAccount.linkedToPage) {
        await deleteLinkedPageData(selectedAccount);
      }
      
      // ثم حذف الحساب من قاعدة البيانات
      await deleteAccount(selectedAccount.id);
      
      let successMessage = `تم حذف الحساب "${selectedAccount.nameAr}" بنجاح`;
      if (selectedAccount.linkedToPage) {
        const pageNames = {
          'customers': 'العملاء',
          'suppliers': 'الموردين', 
          'cashboxes': 'الصناديق',
          'banks': 'البنوك'
        };
        successMessage += ` وتم حذف البيانات المرتبطة من صفحة ${pageNames[selectedAccount.linkedToPage]}`;
      }
      
      toast.success(successMessage);
      
      // إعادة تحميل الحسابات وإلغاء تحديد الحساب المحذوف
      await loadAccounts();
      setSelectedAccount(null);
      setIsEditing(false);
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error(`فشل في حذف الحساب: ${error.message || 'خطأ غير معروف'}`);
    }
  };

  const handleAddClick = () => {
    // التحقق من أن الحساب المحدد له حسابات تحليلية
    if (selectedAccount && !selectedAccount.hasSubAccounts) {
      toast.error(`لا يمكن إضافة حساب فرعي تحت "${selectedAccount.nameAr}" - الحساب ليس له حسابات تحليلية`);
      return;
    }

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
        parentId: selectedAccount.id,
        linkedToPage: undefined,
        customerData: undefined,
        supplierData: undefined,
        cashboxData: undefined,
        bankData: undefined
      });
    } else {
      setNewAccount({
        nameAr: '',
        nameEn: '',
        classification: '', // سيتم تحديده عند كتابة اسم الحساب
        status: 'نشط',
        isClosed: false,
        hasSubAccounts: false,
        level: 1,
        linkedToPage: undefined,
        customerData: undefined,
        supplierData: undefined,
        cashboxData: undefined,
        bankData: undefined
      });
    }
  };

  const saveLinkedPageData = async (linkedToPage: string, accountData: Omit<Account, 'id'>) => {
    const { db } = await import('@/lib/firebase');
    const { collection, addDoc } = await import('firebase/firestore');
    
    try {
      switch (linkedToPage) {
        case 'customers':
          if (accountData.customerData && accountData.customerData.nameAr) {
            // إنشاء رقم عميل جديد
            const customersSnapshot = await import('firebase/firestore').then(({ getDocs, collection }) => 
              getDocs(collection(db, 'customers'))
            );
            
            const existingCustomers = customersSnapshot.docs.map(doc => doc.data() as { id: string });
            const maxNum = existingCustomers
              .map((c: { id: string }) => {
                const match = /^c-(\d{4})$/.exec(c.id);
                return match ? parseInt(match[1], 10) : 0;
              })
              .reduce((a: number, b: number) => Math.max(a, b), 0);
            const newId = `c-${(maxNum + 1).toString().padStart(4, '0')}`;
            
            // تحديد تاريخ اليوم للقيم الافتراضية
            const today = new Date().toISOString().split('T')[0];
            
            const customerDoc = {
              id: newId,
              nameAr: accountData.customerData.nameAr,
              nameEn: accountData.customerData.nameEn || arabicToEnglish(accountData.customerData.nameAr),
              branch: accountData.customerData.branch || '',
              commercialReg: accountData.customerData.commercialReg || '',
              regDate: accountData.customerData.regDate || today,
              regAuthority: accountData.customerData.regAuthority || '',
              businessType: accountData.customerData.businessType || 'فرد',
              activity: accountData.customerData.activity || '',
              startDate: accountData.customerData.startDate || '',
              city: accountData.customerData.city || '',
              creditLimit: accountData.customerData.creditLimit || '',
              region: accountData.customerData.region || '',
              district: accountData.customerData.district || '',
              street: accountData.customerData.street || '',
              buildingNo: accountData.customerData.buildingNo || '',
              postalCode: accountData.customerData.postalCode || '',
              countryCode: accountData.customerData.countryCode || 'SA',
              phone: accountData.customerData.phone || '',
              mobile: accountData.customerData.mobile || '',
              email: accountData.customerData.email || '',
              status: accountData.customerData.status || 'نشط',
              taxFileNumber: accountData.customerData.taxFileNumber || '',
              taxFileExpiry: accountData.customerData.taxFileExpiry || '',
              linkedAccountCode: accountData.code,
              createdAt: new Date().toISOString()
            };
            
            await addDoc(collection(db, 'customers'), customerDoc);
          }
          break;
          
        case 'suppliers':
          if (accountData.supplierData && accountData.supplierData.name && accountData.supplierData.phone) {
            const supplierDoc = {
              name: accountData.supplierData.name,
              companyNumber: accountData.supplierData.companyNumber || '',
              phone: accountData.supplierData.phone,
              address: accountData.supplierData.address || '',
              email: '',
              branch: accountData.supplierData.branch || '',
              linkedAccountCode: accountData.code,
              createdAt: new Date().toISOString()
            };
            
            await addDoc(collection(db, 'suppliers'), supplierDoc);
          }
          break;
          
        case 'cashboxes':
          if (accountData.cashboxData && accountData.cashboxData.nameAr && accountData.cashboxData.nameEn) {
            const cashboxDoc = {
              nameAr: accountData.cashboxData.nameAr,
              nameEn: accountData.cashboxData.nameEn,
              branch: accountData.cashboxData.branch || '',
              mainAccount: accountData.parentId || '',
              subAccountCode: accountData.code,
              linkedAccountCode: accountData.code,
              createdAt: new Date().toISOString()
            };
            
            await addDoc(collection(db, 'cashBoxes'), cashboxDoc);
          }
          break;
          
        case 'banks':
          if (accountData.bankData && accountData.bankData.arabicName && accountData.bankData.englishName) {
            const bankDoc = {
              arabicName: accountData.bankData.arabicName,
              englishName: accountData.bankData.englishName,
              branch: accountData.bankData.branch || '',
              mainAccount: accountData.parentId || '',
              subAccountCode: accountData.code,
              linkedAccountCode: accountData.code,
              createdAt: new Date().toISOString()
            };
            
            await addDoc(collection(db, 'bankAccounts'), bankDoc);
          }
          break;
      }
    } catch (error) {
      console.error(`Error saving data to ${linkedToPage} page:`, error);
      throw error;
    }
  };

  // دالة حذف البيانات من الصفحات المربوطة
  const deleteLinkedPageData = async (account: Account) => {
    if (!account.linkedToPage || !account.code) return;
    
    const { db } = await import('@/lib/firebase');
    const { collection, query, where, getDocs, deleteDoc } = await import('firebase/firestore');
    
    try {
      let collectionName = '';
      const queryField = 'linkedAccountCode';
      
      switch (account.linkedToPage) {
        case 'customers':
          collectionName = 'customers';
          break;
        case 'suppliers':
          collectionName = 'suppliers';
          break;
        case 'cashboxes':
          collectionName = 'cashBoxes';
          break;
        case 'banks':
          collectionName = 'bankAccounts';
          break;
        default:
          return;
      }
      
      // البحث عن الوثائق المربوطة بهذا الحساب
      const q = query(
        collection(db, collectionName),
        where(queryField, '==', account.code)
      );
      
      const querySnapshot = await getDocs(q);
      
      // حذف جميع الوثائق المربوطة
      const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
      
      if (querySnapshot.docs.length > 0) {
        const pageNames = {
          'customers': 'العملاء',
          'suppliers': 'الموردين', 
          'cashboxes': 'الصناديق',
          'banks': 'البنوك'
        };
        
        console.log(`تم حذف ${querySnapshot.docs.length} عنصر من صفحة ${pageNames[account.linkedToPage]}`);
      }
      
    } catch (error) {
      console.error(`Error deleting data from ${account.linkedToPage} page:`, error);
      throw error;
    }
  };

  const handleAddAccount = async () => {
    if (!newAccount.nameAr || !newAccount.nameEn) {
      toast.error('يرجى إدخال اسم الحساب بالعربي والإنجليزي');
      return;
    }
    
    // تحقق من البيانات المطلوبة للصفحات المرتبطة
    if (newAccount.linkedToPage === 'customers' && newAccount.customerData) {
      if (!newAccount.customerData.nameAr) {
        toast.error('يرجى إدخال اسم العميل بالعربي');
        return;
      }
      if (!newAccount.customerData.branch) {
        toast.error('يرجى اختيار الفرع للعميل');
        return;
      }
      if (!newAccount.customerData.businessType) {
        toast.error('يرجى اختيار نوع العمل للعميل');
        return;
      }
      if (!newAccount.customerData.activity) {
        toast.error('يرجى اختيار النشاط للعميل');
        return;
      }
      if (!newAccount.customerData.city) {
        toast.error('يرجى اختيار المدينة للعميل');
        return;
      }
      if (!newAccount.customerData.mobile) {
        toast.error('يرجى إدخال رقم الجوال للعميل');
        return;
      }
    }
    
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
        hasSubAccounts: newAccount.hasSubAccounts || false,
        nature: 'مدينة',
        linkedToPage: newAccount.linkedToPage,
        customerData: newAccount.customerData,
        supplierData: newAccount.supplierData,
        cashboxData: newAccount.cashboxData,
        bankData: newAccount.bankData,
        ...(newAccount.parentId && { parentId: newAccount.parentId })
      };
      
      // حفظ الحساب في قاعدة البيانات
      await addAccount(accountToAdd);
      
      // حفظ البيانات في الصفحة المناسبة إذا تم ربط الحساب بصفحة
      if (newAccount.linkedToPage && accountToAdd.code) {
        await saveLinkedPageData(newAccount.linkedToPage, accountToAdd);
      }
      
      // إذا تم إضافة حساب فرعي، قم بتحديث الحساب الأب ليصبح له حسابات فرعية
      if (newAccount.parentId && selectedAccount) {
        // في التطبيق الحقيقي، يجب تحديث hasSubAccounts في قاعدة البيانات
        // ولكن هنا سنعيد تحميل البيانات لضمان التحديث الصحيح
        let successMessage = `تم إضافة الحساب الفرعي بنجاح تحت ${selectedAccount.nameAr} بالكود ${autoCode}`;
        if (newAccount.linkedToPage === 'customers') {
          successMessage += ` وتم حفظ بيانات العميل في قاعدة البيانات`;
        } else if (newAccount.linkedToPage) {
          successMessage += ` وحفظ البيانات في الصفحة المرتبطة`;
        }
        toast.success(successMessage);
      } else {
        let successMessage = `تم إضافة الحساب الرئيسي بنجاح بالكود ${autoCode}`;
        if (newAccount.linkedToPage === 'customers') {
          successMessage += ` وتم حفظ بيانات العميل في قاعدة البيانات`;
        } else if (newAccount.linkedToPage) {
          successMessage += ` وحفظ البيانات في الصفحة المرتبطة`;
        }
        toast.success(successMessage);
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
    // إعادة تعيين جميع البيانات
    setNewAccount({
      nameAr: '',
      nameEn: '',
      classification: '',
      status: 'نشط',
      isClosed: false,
      hasSubAccounts: false,
      level: 1,
      linkedToPage: undefined,
      customerData: undefined,
      supplierData: undefined,
      cashboxData: undefined,
      bankData: undefined
    });
  };

  const handleSave = async () => {
    if (!selectedAccount || !editForm.nameAr || !editForm.nameEn) {
      toast.error('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    try {
      setIsSaving(true);
      
      // للحسابات الرئيسية: التصنيف = اسم الحساب
      const updatedForm = { ...editForm };
      if (selectedAccount && selectedAccount.level === 1) {
        updatedForm.classification = editForm.nameAr;
      }

      // حفظ التعديلات في قاعدة البيانات
      await updateAccount(selectedAccount.id, updatedForm);
      
      // تحديث الحالة المحلية
      setIsEditing(false);
      setSelectedAccount(updatedForm as Account);
      
      // إعادة تحميل الحسابات لضمان التحديث
      await loadAccounts();
      
      toast.success('تم حفظ التعديلات بنجاح');
    } catch (error) {
      console.error('Error saving account:', error);
      toast.error(`فشل في حفظ التعديلات: ${error.message || 'خطأ غير معروف'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditForm(selectedAccount || {});
    setIsSaving(false);
    setShowDeleteWarning(false);
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
                   <Breadcrumb
        items={[
          { label: "الرئيسية", to: "/" },
          { label: "الادارة الماليه", to: "/management/financial" }, 
          { label: "دليل الحسابات الشجري" },
        ]}
      />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Account Tree - Right Side */}
        <div className="lg:col-span-1">
          <Card className="h-[700px]">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>شجرة الحسابات</span>
                <Button 
                  size="sm" 
                  className="h-8 bg-green-500 hover:bg-green-600 text-white" 
                  onClick={() => loadAccounts()}
                  disabled={isLoading}
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                  تحديث
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
                    <p className="text-gray-500 mb-4">يمكنك إضافة حسابات رئيسية من صفحة "تصنيف الحسابات"</p>
                    <p className="text-blue-600 text-sm">💡 استخدم هذه الصفحة لإضافة الحسابات الفرعية فقط</p>
                  </div>
                ) : (
                  renderAccountTree(accounts)
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
            {!isEditing && !showAddForm ? (
              <>
                <Button 
                  size="sm" 
                  onClick={handleAddClick} 
                  className="h-8 bg-green-500 hover:bg-green-600 text-white disabled:bg-gray-400 disabled:cursor-not-allowed"
                  disabled={!selectedAccount.hasSubAccounts}
                  title={
                    selectedAccount.hasSubAccounts 
                      ? `إضافة حساب فرعي تحت: ${selectedAccount.nameAr}` 
                      : `لا يمكن إضافة حساب فرعي تحت: ${selectedAccount.nameAr} - الحساب ليس له حسابات تحليلية`
                  }
                >
                  <Plus className="h-4 w-4 mr-1" />
                  إضافة حساب فرعي
                </Button>
                <Button 
                  size="sm" 
                  onClick={handleEdit} 
                  className="h-8 bg-blue-500 hover:bg-blue-600 text-white"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  تعديل
                </Button>
                <Button 
                  size="sm" 
                  onClick={handleDelete} 
                  className={`h-8 text-white ${
                    (() => {
                      const flatAccounts = flattenAccountHierarchy(accounts);
                      const hasSubAccounts = flatAccounts.some(account => account.parentId === selectedAccount.id);
                      return hasSubAccounts 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-red-500 hover:bg-red-600';
                    })()
                  }`}
                  disabled={(() => {
                    const flatAccounts = flattenAccountHierarchy(accounts);
                    return flatAccounts.some(account => account.parentId === selectedAccount.id);
                  })()}
                  title={(() => {
                    const flatAccounts = flattenAccountHierarchy(accounts);
                    const hasSubAccounts = flatAccounts.some(account => account.parentId === selectedAccount.id);
                    if (hasSubAccounts) {
                      const subAccountsCount = flatAccounts.filter(account => account.parentId === selectedAccount.id).length;
                      return `لا يمكن حذف "${selectedAccount.nameAr}" - يحتوي على ${subAccountsCount} حساب فرعي`;
                    }
                    return `حذف الحساب "${selectedAccount.nameAr}"`;
                  })()}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  حذف
                </Button>
              </>
            ) : isEditing ? (
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  onClick={handleSave} 
                  className="h-8 bg-blue-500 hover:bg-blue-600 text-white" 
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-1" />
                  )}
                  {isSaving ? 'جاري الحفظ...' : 'حفظ التعديل'}
                </Button>
                <Button 
                  size="sm" 
                  onClick={handleCancel} 
                  className="h-8 bg-blue-100 hover:bg-blue-200 text-blue-700 border-none" 
                  disabled={isSaving}
                >
                  <X className="h-4 w-4 mr-1" />
                  إلغاء
                </Button>
              </div>
            ) : showAddForm ? (
              <div className="flex gap-2">
                <Button size="sm" onClick={handleAddAccount} className="h-8 bg-green-500 hover:bg-green-600 text-white">
                  <Save className="h-4 w-4 mr-1" />
                  إضافة
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={handleCancelAdd} 
                  className="h-8"
                >
                  <X className="h-4 w-4 mr-1" />
                  إلغاء
                </Button>
              </div>
            ) : null}
          </div>
        )}
      </CardTitle>
    </CardHeader>
    
    <CardContent className="space-y-4 overflow-auto h-[600px]">
      {selectedAccount ? (
        <div className="space-y-6">
          {/* رسالة تحذيرية للحسابات التي ليس لها حسابات تحليلية */}
          {!selectedAccount.hasSubAccounts && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center">
                <div className="text-yellow-800">
                  <span className="font-medium">تنبيه:</span> هذا الحساب ليس له حسابات تحليلية، لذا لا يمكن إضافة حسابات فرعية تحته.
                </div>
              </div>
              <div className="text-sm text-yellow-700 mt-2">
                💡 لتمكين إضافة حسابات فرعية، قم بتعديل الحساب وتفعيل خيار "له حسابات تحليلية"
              </div>
            </div>
          )}

          {/* رسالة تحذيرية للحسابات التي تحتوي على حسابات فرعية - تظهر فقط عند الضغط على زر الحذف */}
          {showDeleteWarning && (() => {
            const flatAccounts = flattenAccountHierarchy(accounts);
            const subAccounts = flatAccounts.filter(account => account.parentId === selectedAccount.id);
            const hasSubAccounts = subAccounts.length > 0;
            
            if (hasSubAccounts) {
              return (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-red-800">
                      <span className="font-medium">🚫 تحذير:</span> لا يمكن حذف هذا الحساب لأنه يحتوي على {subAccounts.length} حساب فرعي.
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowDeleteWarning(false)}
                      className="h-6 w-6 p-0 border-red-300 text-red-600 hover:bg-red-100"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                  
                  {/* عرض قائمة الحسابات الفرعية */}
                  <div className="text-sm text-red-700 mb-3">
                    <div className="font-medium mb-2">الحسابات الفرعية الموجودة:</div>
                    <div className="bg-white border border-red-200 rounded p-2 max-h-24 overflow-y-auto">
                      {subAccounts.map((subAccount, index) => (
                        <div key={subAccount.id} className="flex items-center text-xs mb-1">
                          <span className="font-mono text-red-600 mr-2">{subAccount.code}</span>
                          <span className="text-red-800">{subAccount.nameAr}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="text-sm text-red-700 bg-red-100 p-2 rounded">
                    � يجب حذف جميع الحسابات الفرعية المذكورة أعلاه أولاً قبل حذف هذا الحساب
                  </div>
                </div>
              );
            }
            return null;
          })()}

          {/* فورم إضافة حساب فرعي */}
          {showAddForm && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-blue-800">إضافة حساب فرعي</h3>
              </div>
              
              {/* معلومات الحساب الأب */}
              <div className="p-3 bg-white border border-blue-200 rounded-lg">
                <div className="text-sm text-blue-800 font-medium mb-2">
                  سيتم إضافة الحساب الفرعي تحت:
                </div>
                <div className="flex items-center space-x-3 space-x-reverse">
                  <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
                    {selectedAccount.code}
                  </Badge>
                  <span className="text-sm font-medium">{selectedAccount.nameAr}</span>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-2 text-xs text-blue-600">
                  <div>المستوى الجديد: {(selectedAccount.level || 1) + 1}</div>
                  <div>التصنيف: {getRootAccount(selectedAccount, accounts).nameAr}</div>
                </div>
              </div>

              {/* حقول إدخال البيانات */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">اسم الحساب (عربي) *</label>
                  <AntdInput 
                    placeholder="أدخل اسم الحساب بالعربية" 
                    value={newAccount.nameAr} 
                    onChange={(e) => setNewAccount({
                      ...newAccount, 
                      nameAr: e.target.value,
                      ...(newAccount.level === 1 && { classification: e.target.value })
                    })}
                    size="large"
                    className="text-right"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">اسم الحساب (إنجليزي) *</label>
                  <AntdInput 
                    placeholder="Enter account name in English" 
                    value={newAccount.nameEn} 
                    onChange={(e) => setNewAccount({...newAccount, nameEn: e.target.value})}
                    size="large"
                    className="text-left"
                    dir="ltr"
                  />
                </div>
              </div>

              {/* حقل له حسابات تحليلية */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">إعدادات الحساب</label>
                <div className="p-3 bg-white border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <AntdCheckbox
                      checked={newAccount.hasSubAccounts || false}
                      onChange={(e) => setNewAccount({...newAccount, hasSubAccounts: e.target.checked})}
                    >
                      له حسابات تحليلية (يمكن إضافة حسابات فرعية تحته)
                    </AntdCheckbox>
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    💡 إذا لم يتم تحديد هذا الخيار، لن يمكن إضافة حسابات فرعية تحت هذا الحساب مستقبلاً
                  </div>
                </div>
              </div>

              {/* حقل ربط الحساب بصفحة معينة */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">ربط الحساب بصفحة</label>
                <div className="p-3 bg-white border border-gray-200 rounded-lg">
                  <div className="text-sm text-gray-600 mb-3">
                    يمكنك ربط هذا الحساب بإحدى الصفحات التالية لإضافة البيانات التفصيلية:
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <AntdCheckbox
                        checked={newAccount.linkedToPage === 'customers'}
                        onChange={(e) => setNewAccount({
                          ...newAccount, 
                          linkedToPage: e.target.checked ? 'customers' : undefined,
                          // إعادة تعيين البيانات الأخرى عند تغيير النوع
                          supplierData: undefined,
                          cashboxData: undefined,
                          bankData: undefined
                        })}
                      >
                        صفحة العملاء
                      </AntdCheckbox>
                    </div>
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <AntdCheckbox
                        checked={newAccount.linkedToPage === 'suppliers'}
                        onChange={(e) => setNewAccount({
                          ...newAccount, 
                          linkedToPage: e.target.checked ? 'suppliers' : undefined,
                          // إعادة تعيين البيانات الأخرى عند تغيير النوع
                          customerData: undefined,
                          cashboxData: undefined,
                          bankData: undefined
                        })}
                      >
                        صفحة الموردين
                      </AntdCheckbox>
                    </div>
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <AntdCheckbox
                        checked={newAccount.linkedToPage === 'cashboxes'}
                        onChange={(e) => setNewAccount({
                          ...newAccount, 
                          linkedToPage: e.target.checked ? 'cashboxes' : undefined,
                          // إعادة تعيين البيانات الأخرى عند تغيير النوع
                          customerData: undefined,
                          supplierData: undefined,
                          bankData: undefined
                        })}
                      >
                        صفحة الصناديق
                      </AntdCheckbox>
                    </div>
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <AntdCheckbox
                        checked={newAccount.linkedToPage === 'banks'}
                        onChange={(e) => setNewAccount({
                          ...newAccount, 
                          linkedToPage: e.target.checked ? 'banks' : undefined,
                          // إعادة تعيين البيانات الأخرى عند تغيير النوع
                          customerData: undefined,
                          supplierData: undefined,
                          cashboxData: undefined
                        })}
                      >
                        صفحة البنوك
                      </AntdCheckbox>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    💡 عند ربط الحساب بصفحة معينة، ستظهر بيانات إضافية مناسبة لتلك الصفحة عند الإضافة
                  </div>
                </div>
              </div>

              {/* البيانات التفصيلية حسب الصفحة المختارة */}
              {newAccount.linkedToPage && (
                <div className="space-y-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="text-sm font-medium text-blue-800 mb-3">
                    البيانات التفصيلية - {
                      newAccount.linkedToPage === 'customers' ? 'صفحة العملاء' :
                      newAccount.linkedToPage === 'suppliers' ? 'صفحة الموردين' :
                      newAccount.linkedToPage === 'cashboxes' ? 'صفحة الصناديق' :
                      newAccount.linkedToPage === 'banks' ? 'صفحة البنوك' : ''
                    }
                  </div>

                  {/* بيانات العملاء */}
                  {newAccount.linkedToPage === 'customers' && (
                    <>
                      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg mb-4">
                        <div className="text-sm text-yellow-800 font-medium mb-2">
                          📋 ملاحظة: الحقول المطلوبة (*) ضرورية لإنشاء العميل
                        </div>
                        <div className="text-xs text-yellow-700">
                          سيتم حفظ بيانات العميل في قاعدة البيانات تلقائياً مع رقم عميل جديد
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {/* الصف الأول */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">الاسم بالعربي *</label>
                        <AntdInput 
                          placeholder="أدخل اسم العميل بالعربي" 
                          value={newAccount.customerData?.nameAr || ''} 
                          onChange={(e) => setNewAccount({
                            ...newAccount, 
                            customerData: {
                              ...newAccount.customerData,
                              nameAr: e.target.value,
                              nameEn: e.target.value ? arabicToEnglish(e.target.value) : ''
                            }
                          })}
                          size="large"
                          className="text-right"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">الاسم بالإنجليزي</label>
                        <AntdInput 
                          placeholder="تلقائي من الاسم العربي" 
                          value={newAccount.customerData?.nameEn || ''} 
                          disabled
                          size="large"
                          dir="ltr"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">الفرع *</label>
                        <Select
                          value={newAccount.customerData?.branch || ''}
                          onChange={(value) => setNewAccount({
                            ...newAccount, 
                            customerData: {
                              ...newAccount.customerData,
                              branch: value
                            }
                          })}
                          placeholder={branches.length > 0 ? "اختر الفرع" : "جاري تحميل الفروع..."}
                          size="large"
                          style={{ width: '100%' }}
                          disabled={branches.length === 0}
                        >
                          {branches.length > 0 ? (
                            branches.map(branch => (
                              <Select.Option key={branch.id || branch.code} value={branch.name}>{branch.name}</Select.Option>
                            ))
                          ) : (
                            <Select.Option value="" disabled>لا توجد فروع متاحة</Select.Option>
                          )}
                        </Select>
                      </div>

                      {/* الصف الثاني */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">السجل التجاري</label>
                        <AntdInput 
                          placeholder="أدخل رقم السجل التجاري" 
                          value={newAccount.customerData?.commercialReg || ''} 
                          onChange={(e) => setNewAccount({
                            ...newAccount, 
                            customerData: {
                              ...newAccount.customerData,
                              commercialReg: e.target.value
                            }
                          })}
                          size="large"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">تاريخ السجل</label>
                        <DatePicker 
                          placeholder="اختر تاريخ السجل التجاري" 
                          value={newAccount.customerData?.regDate ? dayjs(newAccount.customerData.regDate) : null} 
                          onChange={(date) => setNewAccount({
                            ...newAccount, 
                            customerData: {
                              ...newAccount.customerData,
                              regDate: date ? date.format('YYYY-MM-DD') : ''
                            }
                          })}
                          size="large"
                          style={{ width: '100%' }}
                          format="DD/MM/YYYY"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">جهة الإصدار</label>
                        <AntdInput 
                          placeholder="جهة إصدار السجل التجاري" 
                          value={newAccount.customerData?.regAuthority || ''} 
                          onChange={(e) => setNewAccount({
                            ...newAccount, 
                            customerData: {
                              ...newAccount.customerData,
                              regAuthority: e.target.value
                            }
                          })}
                          size="large"
                        />
                      </div>

                      {/* الصف الثالث */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">نوع العمل *</label>
                        <Select
                          value={newAccount.customerData?.businessType || ''}
                          onChange={(value) => setNewAccount({
                            ...newAccount, 
                            customerData: {
                              ...newAccount.customerData,
                              businessType: value
                            }
                          })}
                          placeholder="اختر نوع العمل"
                          size="large"
                          style={{ width: '100%' }}
                        >
                          <Select.Option value="شركة">شركة</Select.Option>
                          <Select.Option value="مؤسسة">مؤسسة</Select.Option>
                          <Select.Option value="فرد">فرد</Select.Option>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">النشاط *</label>
                        <Select
                          value={newAccount.customerData?.activity || ''}
                          onChange={(value) => setNewAccount({
                            ...newAccount, 
                            customerData: {
                              ...newAccount.customerData,
                              activity: value
                            }
                          })}
                          placeholder="اختر النشاط"
                          size="large"
                          style={{ width: '100%' }}
                        >
                          <Select.Option value="مقاولات">مقاولات</Select.Option>
                          <Select.Option value="تجارة تجزئة">تجارة تجزئة</Select.Option>
                          <Select.Option value="صناعة">صناعة</Select.Option>
                          <Select.Option value="خدمات">خدمات</Select.Option>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">تاريخ بداية التعامل</label>
                        <DatePicker 
                          placeholder="اختر تاريخ بداية التعامل" 
                          value={newAccount.customerData?.startDate ? dayjs(newAccount.customerData.startDate) : null} 
                          onChange={(date) => setNewAccount({
                            ...newAccount, 
                            customerData: {
                              ...newAccount.customerData,
                              startDate: date ? date.format('YYYY-MM-DD') : ''
                            }
                          })}
                          size="large"
                          style={{ width: '100%' }}
                          format="DD/MM/YYYY"
                        />
                      </div>

                      {/* الصف الرابع */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">المدينة *</label>
                        <Select
                          value={newAccount.customerData?.city || ''}
                          onChange={(value) => setNewAccount({
                            ...newAccount, 
                            customerData: {
                              ...newAccount.customerData,
                              city: value
                            }
                          })}
                          placeholder="اختر المدينة"
                          size="large"
                          style={{ width: '100%' }}
                        >
                          <Select.Option value="الرياض">الرياض</Select.Option>
                          <Select.Option value="جدة">جدة</Select.Option>
                          <Select.Option value="الدمام">الدمام</Select.Option>
                          <Select.Option value="مكة">مكة</Select.Option>
                          <Select.Option value="الخبر">الخبر</Select.Option>
                          <Select.Option value="الطائف">الطائف</Select.Option>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">الحد الائتماني (ر.س)</label>
                        <AntdInput 
                          placeholder="الحد الائتماني" 
                          value={newAccount.customerData?.creditLimit || ''} 
                          onChange={(e) => setNewAccount({
                            ...newAccount, 
                            customerData: {
                              ...newAccount.customerData,
                              creditLimit: e.target.value
                            }
                          })}
                          type="number"
                          size="large"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">الحالة *</label>
                        <Select
                          value={newAccount.customerData?.status || 'نشط'}
                          onChange={(value) => setNewAccount({
                            ...newAccount, 
                            customerData: {
                              ...newAccount.customerData,
                              status: value
                            }
                          })}
                          placeholder="اختر الحالة"
                          size="large"
                          style={{ width: '100%' }}
                        >
                          <Select.Option value="نشط">نشط</Select.Option>
                          <Select.Option value="متوقف">متوقف</Select.Option>
                        </Select>
                      </div>

                      {/* الصف الخامس - بيانات الاتصال */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">رقم الجوال *</label>
                        <AntdInput 
                          placeholder="أدخل رقم الجوال" 
                          value={newAccount.customerData?.mobile || ''} 
                          onChange={(e) => setNewAccount({
                            ...newAccount, 
                            customerData: {
                              ...newAccount.customerData,
                              mobile: e.target.value
                            }
                          })}
                          size="large"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">رقم الهاتف</label>
                        <AntdInput 
                          placeholder="أدخل رقم الهاتف الثابت" 
                          value={newAccount.customerData?.phone || ''} 
                          onChange={(e) => setNewAccount({
                            ...newAccount, 
                            customerData: {
                              ...newAccount.customerData,
                              phone: e.target.value
                            }
                          })}
                          size="large"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">البريد الإلكتروني</label>
                        <AntdInput 
                          placeholder="أدخل البريد الإلكتروني" 
                          value={newAccount.customerData?.email || ''} 
                          onChange={(e) => setNewAccount({
                            ...newAccount, 
                            customerData: {
                              ...newAccount.customerData,
                              email: e.target.value
                            }
                          })}
                          type="email"
                          size="large"
                        />
                      </div>

                      {/* قسم العنوان */}
                      <div className="col-span-full">
                        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                          <h4 className="font-medium mb-3 text-gray-800">بيانات العنوان</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-gray-700">المنطقة</label>
                              <AntdInput 
                                placeholder="أدخل المنطقة" 
                                value={newAccount.customerData?.region || ''} 
                                onChange={(e) => setNewAccount({
                                  ...newAccount, 
                                  customerData: {
                                    ...newAccount.customerData,
                                    region: e.target.value
                                  }
                                })}
                                size="large"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-gray-700">الحي</label>
                              <AntdInput 
                                placeholder="أدخل الحي" 
                                value={newAccount.customerData?.district || ''} 
                                onChange={(e) => setNewAccount({
                                  ...newAccount, 
                                  customerData: {
                                    ...newAccount.customerData,
                                    district: e.target.value
                                  }
                                })}
                                size="large"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-gray-700">الشارع</label>
                              <AntdInput 
                                placeholder="أدخل الشارع" 
                                value={newAccount.customerData?.street || ''} 
                                onChange={(e) => setNewAccount({
                                  ...newAccount, 
                                  customerData: {
                                    ...newAccount.customerData,
                                    street: e.target.value
                                  }
                                })}
                                size="large"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-gray-700">رقم المبنى</label>
                              <AntdInput 
                                placeholder="رقم المبنى" 
                                value={newAccount.customerData?.buildingNo || ''} 
                                onChange={(e) => setNewAccount({
                                  ...newAccount, 
                                  customerData: {
                                    ...newAccount.customerData,
                                    buildingNo: e.target.value
                                  }
                                })}
                                size="large"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-gray-700">الرمز البريدي</label>
                              <AntdInput 
                                placeholder="الرمز البريدي" 
                                value={newAccount.customerData?.postalCode || ''} 
                                onChange={(e) => setNewAccount({
                                  ...newAccount, 
                                  customerData: {
                                    ...newAccount.customerData,
                                    postalCode: e.target.value
                                  }
                                })}
                                size="large"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-gray-700">كود الدولة</label>
                              <AntdInput 
                                placeholder="كود الدولة" 
                                value={newAccount.customerData?.countryCode || 'SA'} 
                                onChange={(e) => setNewAccount({
                                  ...newAccount, 
                                  customerData: {
                                    ...newAccount.customerData,
                                    countryCode: e.target.value
                                  }
                                })}
                                size="large"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* قسم الملف الضريبي */}
                      <div className="col-span-full">
                        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                          <h4 className="font-medium mb-3 text-gray-800">بيانات الملف الضريبي</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-gray-700">رقم الملف الضريبي</label>
                              <AntdInput 
                                placeholder="أدخل رقم الملف الضريبي" 
                                value={newAccount.customerData?.taxFileNumber || ''} 
                                onChange={(e) => setNewAccount({
                                  ...newAccount, 
                                  customerData: {
                                    ...newAccount.customerData,
                                    taxFileNumber: e.target.value
                                  }
                                })}
                                size="large"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-gray-700">تاريخ انتهاء الملف الضريبي</label>
                              <DatePicker 
                                placeholder="اختر تاريخ انتهاء الملف الضريبي" 
                                value={newAccount.customerData?.taxFileExpiry ? dayjs(newAccount.customerData.taxFileExpiry) : null} 
                                onChange={(date) => setNewAccount({
                                  ...newAccount, 
                                  customerData: {
                                    ...newAccount.customerData,
                                    taxFileExpiry: date ? date.format('YYYY-MM-DD') : ''
                                  }
                                })}
                                size="large"
                                style={{ width: '100%' }}
                                format="DD/MM/YYYY"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    </>
                  )}

                  {/* بيانات الموردين */}
                  {newAccount.linkedToPage === 'suppliers' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">اسم المورد *</label>
                        <AntdInput 
                          placeholder="أدخل اسم المورد" 
                          value={newAccount.supplierData?.name || ''} 
                          onChange={(e) => setNewAccount({
                            ...newAccount, 
                            supplierData: {
                              ...newAccount.supplierData,
                              name: e.target.value
                            }
                          })}
                          size="large"
                          className="text-right"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">رقم الشركة</label>
                        <AntdInput 
                          placeholder="أدخل رقم الشركة" 
                          value={newAccount.supplierData?.companyNumber || ''} 
                          onChange={(e) => setNewAccount({
                            ...newAccount, 
                            supplierData: {
                              ...newAccount.supplierData,
                              companyNumber: e.target.value
                            }
                          })}
                          size="large"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">رقم الهاتف *</label>
                        <AntdInput 
                          placeholder="أدخل رقم الهاتف" 
                          value={newAccount.supplierData?.phone || ''} 
                          onChange={(e) => setNewAccount({
                            ...newAccount, 
                            supplierData: {
                              ...newAccount.supplierData,
                              phone: e.target.value
                            }
                          })}
                          size="large"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">العنوان</label>
                        <AntdInput 
                          placeholder="أدخل العنوان" 
                          value={newAccount.supplierData?.address || ''} 
                          onChange={(e) => setNewAccount({
                            ...newAccount, 
                            supplierData: {
                              ...newAccount.supplierData,
                              address: e.target.value
                            }
                          })}
                          size="large"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">الفرع</label>
                        <Select
                          value={newAccount.supplierData?.branch || ''}
                          onChange={(value) => setNewAccount({
                            ...newAccount, 
                            supplierData: {
                              ...newAccount.supplierData,
                              branch: value
                            }
                          })}
                          placeholder={branches.length > 0 ? "اختر الفرع" : "جاري تحميل الفروع..."}
                          size="large"
                          style={{ width: '100%' }}
                          disabled={branches.length === 0}
                        >
                          {branches.length > 0 ? (
                            branches.map(branch => (
                              <Select.Option key={branch.id || branch.code} value={branch.name}>{branch.name}</Select.Option>
                            ))
                          ) : (
                            <Select.Option value="" disabled>لا توجد فروع متاحة</Select.Option>
                          )}
                        </Select>
                      </div>
                    </div>
                  )}

                  {/* بيانات الصناديق */}
                  {newAccount.linkedToPage === 'cashboxes' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">اسم الصندوق (عربي) *</label>
                        <AntdInput 
                          placeholder="أدخل اسم الصندوق بالعربي" 
                          value={newAccount.cashboxData?.nameAr || ''} 
                          onChange={(e) => setNewAccount({
                            ...newAccount, 
                            cashboxData: {
                              ...newAccount.cashboxData,
                              nameAr: e.target.value
                            }
                          })}
                          size="large"
                          className="text-right"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">اسم الصندوق (إنجليزي) *</label>
                        <AntdInput 
                          placeholder="Enter cashbox name in English" 
                          value={newAccount.cashboxData?.nameEn || ''} 
                          onChange={(e) => setNewAccount({
                            ...newAccount, 
                            cashboxData: {
                              ...newAccount.cashboxData,
                              nameEn: e.target.value
                            }
                          })}
                          size="large"
                          dir="ltr"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">الفرع</label>
                        <Select
                          value={newAccount.cashboxData?.branch || ''}
                          onChange={(value) => setNewAccount({
                            ...newAccount, 
                            cashboxData: {
                              ...newAccount.cashboxData,
                              branch: value
                            }
                          })}
                          placeholder={branches.length > 0 ? "اختر الفرع" : "جاري تحميل الفروع..."}
                          size="large"
                          style={{ width: '100%' }}
                          disabled={branches.length === 0}
                        >
                          {branches.length > 0 ? (
                            branches.map(branch => (
                              <Select.Option key={branch.id || branch.code} value={branch.name}>{branch.name}</Select.Option>
                            ))
                          ) : (
                            <Select.Option value="" disabled>لا توجد فروع متاحة</Select.Option>
                          )}
                        </Select>
                      </div>
                    </div>
                  )}

                  {/* بيانات البنوك */}
                  {newAccount.linkedToPage === 'banks' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">اسم البنك (عربي) *</label>
                        <AntdInput 
                          placeholder="أدخل اسم البنك بالعربي" 
                          value={newAccount.bankData?.arabicName || ''} 
                          onChange={(e) => setNewAccount({
                            ...newAccount, 
                            bankData: {
                              ...newAccount.bankData,
                              arabicName: e.target.value
                            }
                          })}
                          size="large"
                          className="text-right"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">اسم البنك (إنجليزي) *</label>
                        <AntdInput 
                          placeholder="Enter bank name in English" 
                          value={newAccount.bankData?.englishName || ''} 
                          onChange={(e) => setNewAccount({
                            ...newAccount, 
                            bankData: {
                              ...newAccount.bankData,
                              englishName: e.target.value
                            }
                          })}
                          size="large"
                          dir="ltr"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">الفرع</label>
                        <Select
                          value={newAccount.bankData?.branch || ''}
                          onChange={(value) => setNewAccount({
                            ...newAccount, 
                            bankData: {
                              ...newAccount.bankData,
                              branch: value
                            }
                          })}
                          placeholder={branches.length > 0 ? "اختر الفرع" : "جاري تحميل الفروع..."}
                          size="large"
                          style={{ width: '100%' }}
                          disabled={branches.length === 0}
                        >
                          {branches.length > 0 ? (
                            branches.map(branch => (
                              <Select.Option key={branch.id || branch.code} value={branch.name}>{branch.name}</Select.Option>
                            ))
                          ) : (
                            <Select.Option value="" disabled>لا توجد فروع متاحة</Select.Option>
                          )}
                        </Select>
                      </div>
                    </div>
                  )}

                  <div className="text-xs text-blue-600 mt-3">
                    💡 هذه البيانات ستُحفظ في قاعدة بيانات العملاء تلقائياً عند حفظ الحساب. سيتم إنشاء رقم عميل جديد تلقائياً ويمكنك إدارة بيانات العميل لاحقاً من صفحة العملاء.
                  </div>
                </div>
              )}

              {/* معلومة إضافية */}
              <div className="p-3 bg-green-50 border border-green-200 rounded text-sm text-green-800">
                💡 سيتم إنشاء كود الحساب الفرعي تلقائياً بناءً على كود الحساب الأب: {selectedAccount.code} (مثال: {selectedAccount.code}1)
              </div>
            </div>
          )}

          {/* تفاصيل الحساب الحالي */}
          {!showAddForm && (
            <>
              {/* الصف الأول: 3 أعمدة */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* تصنيف الحساب */}
            <div className="space-y-2">
              <div className="font-semibold mb-1">تصنيف الحساب</div>
              {isEditing && selectedAccount.level === 1 ? (
                <div className="space-y-2">
                  <div className="p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
                    💡 التصنيف للحساب الرئيسي هو اسم الحساب نفسه
                  </div>
                  <AntdInput
                    value={editForm.nameAr || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditForm({
                      ...editForm,
                      nameAr: e.target.value,
                      classification: e.target.value
                    })}
                    placeholder="اسم الحساب (والذي سيكون التصنيف)"
                    className="text-right"
                    size="large"
                  />
                </div>
              ) : (
                <div className="p-2 bg-gray-50 rounded border">
                  <Badge style={{ background: '#e3f2fd', color: '#1565c0', borderColor: '#90caf9' }}>
                    {selectedAccount.level === 1
                      ? selectedAccount.nameAr
                      : getRootAccount(selectedAccount, accounts).nameAr}
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
            <div className="font-semibold mb-1">الحساب الأب</div>
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
            <div className="font-semibold mb-1">المستوى</div>
              <div className="p-2 bg-gray-50 rounded border">
                <Badge style={{ background: '#f0f7fa', color: '#1976d2', borderColor: '#90caf9' }}>المستوى {selectedAccount.level}</Badge>
              </div>
            </div>
          </div>

          {/* الصف الثاني: 3 أعمدة */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* رقم الحساب */}
            <div className="space-y-2">
            <div className="font-semibold mb-1">رقم الحساب</div>
            {isEditing ? (
              <AntdInput
                value={editForm.code || ''}
                className="text-right"
                size="large"
                readOnly
                disabled
              />
            ) : (
              <div className="p-2 bg-gray-50 rounded border font-mono">
                {selectedAccount.code}
              </div>
            )}
            </div>

            {/* اسم الحساب (عربي) */}
            <div className="space-y-2">
            <div className="font-semibold mb-1">اسم الحساب (عربي)</div>
            {isEditing ? (
              <AntdInput
                value={editForm.nameAr || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditForm({ ...editForm, nameAr: e.target.value })}
                className="text-right"
                size="large"
              />
            ) : (
              <div className="p-2 bg-gray-50 rounded border">
                {selectedAccount.nameAr}
              </div>
            )}
            </div>

            {/* اسم الحساب (إنجليزي) */}
            <div className="space-y-2">
            <div className="font-semibold mb-1">اسم الحساب (إنجليزي)</div>
            {isEditing ? (
              <AntdInput
                value={editForm.nameEn || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditForm({ ...editForm, nameEn: e.target.value })}
                className="text-left"
                size="large"
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
            <div className="font-semibold mb-1">مركز التكلفة</div>
            {isEditing ? (
              <Select
                value={editForm.costCenter}
                onChange={value => setEditForm({ ...editForm, costCenter: value })}
                placeholder="اختر مركز التكلفة"
                style={{ width: '100%' }}
                size="large"
              >
                {costCenters.map(center => (
                  <Select.Option key={center} value={center}>{center}</Select.Option>
                ))}
              </Select>
            ) : (
              <div className="p-2 bg-gray-50 rounded border">
                {selectedAccount.costCenter || 'غير محدد'}
              </div>
            )}
            </div>

            {/* حالة الحساب */}
            <div className="space-y-2">
            <div className="font-semibold mb-1">حالة الحساب</div>
            {isEditing ? (
              <Select
                value={editForm.status}
                onChange={value => setEditForm({ ...editForm, status: value })}
                style={{ width: '100%' }}
                size="large"
              >
                <Select.Option value="نشط">نشط</Select.Option>
                <Select.Option value="غير نشط">غير نشط</Select.Option>
              </Select>
            ) : (
              <div className="p-2 bg-gray-50 rounded border">
                <Badge style={{ background: selectedAccount.status === 'نشط' ? '#e8f5e9' : '#f5f5f5', color: selectedAccount.status === 'نشط' ? '#388e3c' : '#757575' }}>{selectedAccount.status}</Badge>
              </div>
            )}
            </div>

            {/* حالة الإقفال */}
            <div className="space-y-2">
            <div className="font-semibold mb-1">الإقفال</div>
            {isEditing ? (
              <div className="flex items-center space-x-2 space-x-reverse p-2">
                <AntdCheckbox
                  checked={editForm.isClosed || false}
                  onChange={e => setEditForm({ ...editForm, isClosed: e.target.checked })}
                >
                  مقفل
                </AntdCheckbox>
              </div>
            ) : (
              <div className="p-2 bg-gray-50 rounded border">
                <Badge style={{ background: selectedAccount.isClosed ? '#ffebee' : '#e8f5e9', color: selectedAccount.isClosed ? '#c62828' : '#388e3c' }}>{selectedAccount.isClosed ? 'مقفل' : 'مفتوح'}</Badge>
              </div>
            )}
            </div>
          </div>

          {/* الصف الرابع: له حسابات تحليلية (مركز) */}
          <div className="flex justify-center">
            <div className="w-full max-w-sm space-y-2">
              <div className="font-semibold mb-1">له حسابات تحليلية</div>
              {isEditing ? (
                <div className="flex items-center justify-center space-x-2 space-x-reverse p-2">
                  <AntdCheckbox
                    checked={editForm.hasSubAccounts || false}
                    onChange={e => setEditForm({ ...editForm, hasSubAccounts: e.target.checked })}
                  >
                    له حسابات فرعية
                  </AntdCheckbox>
                </div>
              ) : (
                <div className="p-2 bg-gray-50 rounded border text-center">
                  <Badge style={{ background: selectedAccount.hasSubAccounts ? '#e3f2fd' : '#f5f5f5', color: selectedAccount.hasSubAccounts ? '#1565c0' : '#757575' }}>{selectedAccount.hasSubAccounts ? 'نعم' : 'لا'}</Badge>
                </div>
              )}
            </div>
          </div>

          {/* قسم معلومات الربط مع الصفحات */}
          {selectedAccount.linkedToPage && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <Link className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-blue-800">مربوط بصفحة</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="text-sm font-medium text-gray-700">نوع الصفحة</div>
                  <div className="p-2 bg-white rounded border">
                    <Badge variant="outline" className="bg-blue-100 text-blue-800">
                      {selectedAccount.linkedToPage === 'customers' ? 'صفحة العملاء' :
                       selectedAccount.linkedToPage === 'suppliers' ? 'صفحة الموردين' :
                       selectedAccount.linkedToPage === 'cashboxes' ? 'صفحة الصناديق' :
                       selectedAccount.linkedToPage === 'banks' ? 'صفحة البنوك' : ''}
                    </Badge>
                  </div>
                </div>
                
                {/* عرض البيانات المرتبطة */}
                {selectedAccount.linkedToPage === 'customers' && selectedAccount.customerData && (
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-gray-700">بيانات العميل</div>
                    <div className="p-2 bg-white rounded border text-sm">
                      <div>الاسم: {selectedAccount.customerData.nameAr}</div>
                      {selectedAccount.customerData.phone && <div>الهاتف: {selectedAccount.customerData.phone}</div>}
                      {selectedAccount.customerData.businessType && <div>نوع العمل: {selectedAccount.customerData.businessType}</div>}
                    </div>
                  </div>
                )}
                
                {selectedAccount.linkedToPage === 'suppliers' && selectedAccount.supplierData && (
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-gray-700">بيانات المورد</div>
                    <div className="p-2 bg-white rounded border text-sm">
                      <div>الاسم: {selectedAccount.supplierData.name}</div>
                      {selectedAccount.supplierData.phone && <div>الهاتف: {selectedAccount.supplierData.phone}</div>}
                      {selectedAccount.supplierData.companyNumber && <div>رقم الشركة: {selectedAccount.supplierData.companyNumber}</div>}
                    </div>
                  </div>
                )}
                
                {selectedAccount.linkedToPage === 'cashboxes' && selectedAccount.cashboxData && (
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-gray-700">بيانات الصندوق</div>
                    <div className="p-2 bg-white rounded border text-sm">
                      <div>الاسم العربي: {selectedAccount.cashboxData.nameAr}</div>
                      <div>الاسم الإنجليزي: {selectedAccount.cashboxData.nameEn}</div>
                      {selectedAccount.cashboxData.branch && <div>الفرع: {selectedAccount.cashboxData.branch}</div>}
                    </div>
                  </div>
                )}
                
                {selectedAccount.linkedToPage === 'banks' && selectedAccount.bankData && (
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-gray-700">بيانات البنك</div>
                    <div className="p-2 bg-white rounded border text-sm">
                      <div>الاسم العربي: {selectedAccount.bankData.arabicName}</div>
                      <div>الاسم الإنجليزي: {selectedAccount.bankData.englishName}</div>
                      {selectedAccount.bankData.branch && <div>الفرع: {selectedAccount.bankData.branch}</div>}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="mt-3 p-2 bg-blue-100 rounded text-xs text-blue-700">
                💡 هذا الحساب مربوط بالصفحة المذكورة أعلاه وتم حفظ البيانات فيها تلقائياً عند إنشاء الحساب
              </div>
            </div>
          )}
            </>
          )}
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
