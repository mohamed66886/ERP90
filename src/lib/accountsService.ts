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
