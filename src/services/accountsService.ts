// Firebase implementation of accountsService.ts
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { debugLog, debugError, debugTime, debugTimeEnd } from '@/utils/debug';

export interface Account {
  id: string;
  code: string;
  nameAr: string;
  nameEn: string;
  classification: string;
  nature?: 'مدينة' | 'دائنة';
  balance: number;
  level?: number;
  parentId?: string;
  children?: Account[];
  costCenter?: string;
  isClosed?: boolean;
  status?: 'نشط' | 'غير نشط';
  hasSubAccounts?: boolean;
  // الخصائص الجديدة للربط مع الصفحات
  linkedToPage?: 'customers' | 'suppliers' | 'cashboxes' | 'banks';
  customerData?: {
    nameAr?: string;
    nameEn?: string;
    branch?: string;
    commercialReg?: string;
    regDate?: string;
    regAuthority?: string;
    businessType?: string;
    activity?: string;
    startDate?: string;
    city?: string;
    creditLimit?: string;
    region?: string;
    district?: string;
    street?: string;
    buildingNo?: string;
    postalCode?: string;
    countryCode?: string;
    phone?: string;
    mobile?: string;
    email?: string;
    status?: "نشط" | "متوقف";
    taxFileNumber?: string;
    taxFileExpiry?: string;
  };
  supplierData?: {
    name?: string;
    companyNumber?: string;
    phone?: string;
    address?: string;
    branch?: string;
  };
  cashboxData?: {
    nameAr?: string;
    nameEn?: string;
    branch?: string;
  };
  bankData?: {
    arabicName?: string;
    englishName?: string;
    branch?: string;
  };
}

export const getAccounts = async (): Promise<Account[]> => {
  try {
    debugTime('getAccounts');
    debugLog('Fetching accounts from Firebase...');
    
    const querySnapshot = await getDocs(collection(db, 'accounts'));
    const accounts: Account[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      accounts.push({ 
        id: doc.id, 
        ...data,
        // Ensure required fields have defaults
        level: data.level || 1,
        balance: data.balance || 0,
        status: data.status || 'نشط',
        hasSubAccounts: data.hasSubAccounts || false,
        nature: data.nature || 'مدينة'
      } as Account);
    });
    
    debugTimeEnd('getAccounts');
    debugLog(`Successfully fetched ${accounts.length} accounts from Firebase`, accounts);
    return accounts;
  } catch (error) {
    debugError('Error fetching accounts from Firebase', error);
    
    // Return empty array instead of throwing to prevent app crash
    if (error instanceof Error) {
      throw new Error(`خطأ في تحميل الحسابات: ${error.message}`);
    } else {
      throw new Error('خطأ غير معروف في تحميل الحسابات');
    }
  }
};

export const addAccount = async (account: Omit<Account, 'id'>): Promise<void> => {
  try {
    // تنظيف البيانات من القيم undefined قبل الحفظ
    const cleanAccount: Record<string, unknown> = { ...account };
    
    // إزالة الحقول undefined
    Object.keys(cleanAccount).forEach(key => {
      if (cleanAccount[key] === undefined) {
        delete cleanAccount[key];
      }
    });
    
    await addDoc(collection(db, 'accounts'), cleanAccount);
    console.log('Account added successfully to Firebase');
  } catch (error) {
    console.error('Error adding account:', error);
    throw error;
  }
};

export const deleteAccount = async (id: string): Promise<void> => {
  try {
    // التحقق من وجود حسابات فرعية قبل الحذف
    const allAccounts = await getAccounts();
    const subAccounts = allAccounts.filter(account => account.parentId === id);
    
    if (subAccounts.length > 0) {
      const accountToDelete = allAccounts.find(account => account.id === id);
      throw new Error(`لا يمكن حذف الحساب "${accountToDelete?.nameAr}" لأنه يحتوي على ${subAccounts.length} حساب فرعي`);
    }
    
    await deleteDoc(doc(db, 'accounts', id));
    console.log('Account deleted successfully from Firebase');
  } catch (error) {
    console.error('Error deleting account:', error);
    throw error;
  }
};

export const getAccountCodes = async (): Promise<string[]> => {
  try {
    const accounts = await getAccounts();
    return accounts.map(account => account.code);
  } catch (error) {
    console.error('Error fetching account codes:', error);
    return [];
  }
};

export const updateAccount = async (id: string, updates: Partial<Account>): Promise<void> => {
  try {
    // تنظيف البيانات من القيم undefined قبل التحديث
    const cleanUpdates: Record<string, unknown> = { ...updates };
    
    // إزالة الحقول undefined
    Object.keys(cleanUpdates).forEach(key => {
      if (cleanUpdates[key] === undefined) {
        delete cleanUpdates[key];
      }
    });
    
    await updateDoc(doc(db, 'accounts', id), cleanUpdates);
    console.log('Account updated successfully in Firebase');
  } catch (error) {
    console.error('Error updating account:', error);
    throw error;
  }
};

export const getMainAccounts = async (): Promise<Account[]> => {
  try {
    const allAccounts = await getAccounts();
    // Return accounts that don't have a parentId (main accounts)
    return allAccounts.filter(account => !account.parentId || account.parentId === '');
  } catch (error) {
    console.error('Error fetching main accounts:', error);
    return [];
  }
};

export const getSubAccounts = async (parentId: string): Promise<Account[]> => {
  try {
    const allAccounts = await getAccounts();
    return allAccounts.filter(account => account.parentId === parentId);
  } catch (error) {
    console.error('Error fetching sub accounts:', error);
    return [];
  }
};

export const getAccountsByLevel = async (level: number): Promise<Account[]> => {
  try {
    const allAccounts = await getAccounts();
    return allAccounts.filter(account => account.level === level);
  } catch (error) {
    console.error('Error fetching accounts by level:', error);
    return [];
  }
};

export const getAccountLevels = async (): Promise<number[]> => {
  try {
    const allAccounts = await getAccounts();
    const levels = [...new Set(allAccounts.map(account => account.level || 1))];
    return levels.sort((a, b) => a - b);
  } catch (error) {
    console.error('Error fetching account levels:', error);
    return [1];
  }
};

export const generateSubAccountCode = async (parentAccountId: string): Promise<string> => {
  try {
    const allAccounts = await getAccounts();
    const parentAccount = allAccounts.find(account => account.id === parentAccountId);
    
    if (!parentAccount) {
      throw new Error('الحساب الرئيسي غير موجود');
    }

    const subAccounts = allAccounts.filter(account => account.parentId === parentAccountId);
    const parentCode = parentAccount.code;
    
    // Generate next sub-account code
    let nextSubCode = 1;
    const existingSubCodes = subAccounts.map(account => {
      const codeStr = account.code;
      // Extract the sub-account number from the code
      const match = codeStr.match(new RegExp(`^${parentCode}(\\d+)$`));
      return match ? parseInt(match[1]) : 0;
    }).filter(num => num > 0);
    
    if (existingSubCodes.length > 0) {
      nextSubCode = Math.max(...existingSubCodes) + 1;
    }
    
    // Format sub-account code without leading zeros
    const subCodeStr = nextSubCode.toString();
    return `${parentCode}${subCodeStr}`;
  } catch (error) {
    console.error('Error generating sub account code:', error);
    throw error;
  }
};

export const getAccountById = async (id: string): Promise<Account | null> => {
  try {
    const allAccounts = await getAccounts();
    const account = allAccounts.find(account => account.id === id);
    return account || null;
  } catch (error) {
    console.error('Error fetching account by ID:', error);
    return null;
  }
};

export const createSubAccount = async (
  parentAccountId: string,
  nameAr: string,
  nameEn: string,
  costCenter?: string
): Promise<Account> => {
  try {
    const allAccounts = await getAccounts();
    const parentAccount = allAccounts.find(account => account.id === parentAccountId);
    
    if (!parentAccount) {
      throw new Error('الحساب الرئيسي غير موجود');
    }

    const subAccountCode = await generateSubAccountCode(parentAccountId);
    
    const subAccount: Omit<Account, 'id'> = {
      code: subAccountCode,
      nameAr,
      nameEn,
      classification: parentAccount.classification,
      nature: parentAccount.nature,
      balance: 0,
      level: (parentAccount.level || 1) + 1,
      parentId: parentAccountId,
      costCenter,
      isClosed: false,
      status: 'نشط',
      hasSubAccounts: false
    };

    const docRef = await addDoc(collection(db, 'accounts'), subAccount);
    
    // Update parent account to indicate it has sub-accounts
    await updateDoc(doc(db, 'accounts', parentAccountId), { hasSubAccounts: true });
    
    return { id: docRef.id, ...subAccount };
  } catch (error) {
    console.error('Error creating sub account:', error);
    throw error;
  }
};
