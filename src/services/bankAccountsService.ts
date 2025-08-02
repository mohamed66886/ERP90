import { db } from '@/services/firebase';
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc
} from 'firebase/firestore';

export interface BankAccount {
  id?: string;
  serialNumber: number;
  arabicName: string;
  englishName: string;
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

export async function updateBankAccount(id: string, account: Omit<BankAccount, 'id' | 'serialNumber'>): Promise<void> {
  await updateDoc(doc(db, COLLECTION_NAME, id), account);
}

export async function deleteBankAccount(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION_NAME, id));
}
