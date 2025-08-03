import { db } from '@/services/firebase';
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc
} from 'firebase/firestore';
import { createSubAccount, deleteAccount } from './accountsService';

export interface BankAccount {
  id?: string;
  serialNumber: number;
  arabicName: string;
  englishName: string;
  branch?: string;
  mainAccount?: string;
  subAccountId?: string;
  subAccountCode?: string;
}

const COLLECTION_NAME = 'bankAccounts';

export async function fetchBankAccounts(): Promise<BankAccount[]> {
  const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
  return querySnapshot.docs.map((docSnap, idx) => ({
    id: docSnap.id,
    ...docSnap.data(),
    serialNumber: idx + 1,
  })) as BankAccount[];
}

export async function addBankAccount(account: Omit<BankAccount, 'id' | 'serialNumber'>): Promise<void> {
  await addDoc(collection(db, COLLECTION_NAME), account);
}

export async function addBankAccountWithSubAccount(bankData: {
  arabicName: string;
  englishName: string;
  branch: string;
  mainAccount: string;
}) {
  try {
    // إنشاء حساب فرعي للبنك
    const subAccount = await createSubAccount(
      bankData.mainAccount,
      `بنك - ${bankData.arabicName}`,
      `Bank - ${bankData.englishName}`,
      bankData.branch // استخدام الفرع كمركز تكلفة
    );

    // إنشاء البنك مع ربطه بالحساب الفرعي
    const bankAccount: Omit<BankAccount, 'id' | 'serialNumber'> = {
      arabicName: bankData.arabicName,
      englishName: bankData.englishName,
      branch: bankData.branch,
      mainAccount: bankData.mainAccount,
      subAccountId: subAccount.id,
      subAccountCode: subAccount.code
    };

    await addDoc(collection(db, COLLECTION_NAME), bankAccount);
    
    return {
      success: true,
      subAccount,
      message: 'تم إنشاء البنك والحساب الفرعي بنجاح'
    };
  } catch (error) {
    console.error('Error adding bank account with sub account:', error);
    throw error;
  }
}

export async function updateBankAccount(id: string, account: Omit<BankAccount, 'id' | 'serialNumber'>): Promise<void> {
  await updateDoc(doc(db, COLLECTION_NAME, id), account);
}

export async function deleteBankAccount(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION_NAME, id));
}

export async function deleteBankAccountWithSubAccount(id: string) {
  try {
    // الحصول على بيانات البنك أولاً
    const bankAccounts = await fetchBankAccounts();
    const bankAccount = bankAccounts.find(ba => ba.id === id);
    
    if (!bankAccount) {
      throw new Error('البنك غير موجود');
    }

    // حذف الحساب الفرعي إذا كان موجوداً
    if (bankAccount.subAccountId) {
      await deleteAccount(bankAccount.subAccountId);
    }

    // حذف البنك
    await deleteDoc(doc(db, COLLECTION_NAME, id));
    
    return {
      success: true,
      message: 'تم حذف البنك والحساب الفرعي بنجاح'
    };
  } catch (error) {
    console.error('Error deleting bank account with sub account:', error);
    throw error;
  }
}
