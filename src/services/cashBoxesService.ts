import { db } from './firebase';
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  DocumentData,
} from 'firebase/firestore';
import { createSubAccount, deleteAccount } from './accountsService';

export interface CashBox {
  id?: string;
  nameAr: string;
  nameEn: string;
  branch: string;
  mainAccount?: string;
  subAccountId?: string; // الحساب الفرعي المنشأ للصندوق
  subAccountCode?: string; // كود الحساب الفرعي
}

const COLLECTION_NAME = 'cashBoxes';

export const fetchCashBoxes = async (): Promise<CashBox[]> => {
  const snapshot = await getDocs(collection(db, COLLECTION_NAME));
  return snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() })) as CashBox[];
};

export const addCashBox = async (cashBox: Omit<CashBox, 'id'>) => {
  await addDoc(collection(db, COLLECTION_NAME), cashBox);
};

export const addCashBoxWithSubAccount = async (cashBoxData: {
  nameAr: string;
  nameEn: string;
  branch: string;
  mainAccount: string;
}) => {
  try {
    // إنشاء حساب فرعي للصندوق
    const subAccount = await createSubAccount(
      cashBoxData.mainAccount,
      `صندوق - ${cashBoxData.nameAr}`,
      `Cashbox - ${cashBoxData.nameEn}`,
      cashBoxData.branch // استخدام الفرع كمركز تكلفة
    );

    // إنشاء الصندوق مع ربطه بالحساب الفرعي
    const cashBox: Omit<CashBox, 'id'> = {
      nameAr: cashBoxData.nameAr,
      nameEn: cashBoxData.nameEn,
      branch: cashBoxData.branch,
      mainAccount: cashBoxData.mainAccount,
      subAccountId: subAccount.id,
      subAccountCode: subAccount.code
    };

    await addDoc(collection(db, COLLECTION_NAME), cashBox);
    
    return {
      success: true,
      subAccount,
      message: 'تم إنشاء الصندوق والحساب الفرعي بنجاح'
    };
  } catch (error) {
    console.error('Error adding cash box with sub account:', error);
    throw error;
  }
};

export const deleteCashBox = async (id: string) => {
  await deleteDoc(doc(db, COLLECTION_NAME, id));
};

export const deleteCashBoxWithSubAccount = async (id: string) => {
  try {
    // الحصول على بيانات الصندوق أولاً
    const cashBoxes = await fetchCashBoxes();
    const cashBox = cashBoxes.find(cb => cb.id === id);
    
    if (!cashBox) {
      throw new Error('الصندوق غير موجود');
    }

    // حذف الحساب الفرعي إذا كان موجوداً
    if (cashBox.subAccountId) {
      await deleteAccount(cashBox.subAccountId);
    }

    // حذف الصندوق
    await deleteDoc(doc(db, COLLECTION_NAME, id));
    
    return {
      success: true,
      message: 'تم حذف الصندوق والحساب الفرعي بنجاح'
    };
  } catch (error) {
    console.error('Error deleting cash box with sub account:', error);
    throw error;
  }
};

export const updateCashBox = async (id: string, data: Partial<CashBox>) => {
  await updateDoc(doc(db, COLLECTION_NAME, id), data);
};
