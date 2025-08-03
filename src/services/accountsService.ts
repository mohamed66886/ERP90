// Firebase implementation of accountsService.ts
import { db } from './firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';

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
}

export const getAccounts = async (): Promise<Account[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, 'accounts'));
    const accounts: Account[] = [];
    querySnapshot.forEach((doc) => {
      accounts.push({ id: doc.id, ...doc.data() } as Account);
    });
    return accounts;
  } catch (error) {
    console.error('Error fetching accounts:', error);
    return [];
  }
};

export const addAccount = async (account: Omit<Account, 'id'>): Promise<void> => {
  try {
    await addDoc(collection(db, 'accounts'), account);
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
    await updateDoc(doc(db, 'accounts', id), updates);
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
    
    // Format sub-account code with leading zeros if needed
    const subCodeStr = nextSubCode.toString().padStart(2, '0');
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
