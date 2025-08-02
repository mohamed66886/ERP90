import { db } from './firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, query, where, DocumentData } from 'firebase/firestore';
export const getActiveFinancialYears = async (): Promise<FinancialYear[]> => {
  const q = query(collection(db, 'financialYears'), where('status', '==', 'نشطة'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as FinancialYear[];
};
export const deleteFinancialYear = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, 'financialYears', id));
};

export const updateFinancialYear = async (id: string, data: Partial<Omit<FinancialYear, 'id'>>): Promise<void> => {
  await updateDoc(doc(db, 'financialYears', id), data);
};

export interface FinancialYear {
  id: string;
  year: number;
  startDate: string;
  endDate: string;
  status: string;
  createdAt?: string;
}

export const addFinancialYear = async (data: Omit<FinancialYear, 'id'>): Promise<void> => {
  await addDoc(collection(db, 'financialYears'), {
    ...data,
    createdAt: new Date().toISOString().split('T')[0],
  });
};

export const getFinancialYears = async (): Promise<FinancialYear[]> => {
  const snapshot = await getDocs(collection(db, 'financialYears'));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as FinancialYear[];
};
