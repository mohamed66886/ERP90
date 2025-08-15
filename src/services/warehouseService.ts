import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  serverTimestamp,
  query,
  orderBy,
  where,
  getDoc
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { createSubAccount, deleteAccount } from './accountsService';

export interface WarehouseData {
  nameAr: string;
  nameEn: string;
  branch?: string;
  address?: string;
  status: 'active' | 'inactive' | 'suspended';
  mainAccount?: string;
  subAccountId?: string;
  subAccountCode?: string;
  allowedUsers?: string[];
  allowedBranches?: string[];
  documentType?: 'invoice' | 'warehouse';
  invoiceTypes?: string[];
  warehouseOperations?: string[];
}

export interface Warehouse extends WarehouseData {
  id: string;
  createdAt?: import('firebase/firestore').Timestamp | null;
  updatedAt?: import('firebase/firestore').Timestamp | null;
}

// إضافة مخزن جديد مع حساب فرعي
export const addWarehouseWithSubAccount = async (warehouseData: Record<string, unknown>): Promise<string> => {
  try {
    // تنظيف البيانات قبل الإرسال
    const cleanData = Object.fromEntries(
      Object.entries(warehouseData).filter(([_, value]) => value !== undefined && value !== null && value !== '')
    );

    // إنشاء حساب فرعي للمخزن إذا تم تحديد الحساب الرئيسي
    let subAccount = null;
    if (cleanData.mainAccount && typeof cleanData.mainAccount === 'string') {
      subAccount = await createSubAccount(
        cleanData.mainAccount,
        `${cleanData.nameAr}`,
        `${cleanData.nameEn}`,
        cleanData.branch as string // استخدام الفرع كمركز تكلفة
      );
    }

    // إنشاء المخزن مع ربطه بالحساب الفرعي
    const warehouseToAdd = {
      ...cleanData,
      ...(subAccount && {
        subAccountId: subAccount.id,
        subAccountCode: subAccount.code
      }),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const warehouseRef = await addDoc(collection(db, 'warehouses'), warehouseToAdd);

    return warehouseRef.id;
  } catch (error) {
    console.error('Error adding warehouse with sub account:', error);
    throw error;
  }
};

// تحديث مخزن
export const updateWarehouse = async (warehouseId: string, warehouseData: Record<string, unknown>): Promise<void> => {
  try {
    // تنظيف البيانات قبل الإرسال
    const cleanData = Object.fromEntries(
      Object.entries(warehouseData).filter(([_, value]) => value !== undefined && value !== null && value !== '')
    );

    await updateDoc(doc(db, 'warehouses', warehouseId), {
      ...cleanData,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating warehouse:', error);
    throw error;
  }
};

// حذف مخزن مع الحساب الفرعي
export const deleteWarehouseWithSubAccount = async (warehouseId: string): Promise<void> => {
  try {
    // الحصول على بيانات المخزن
    const warehouseDoc = await getDoc(doc(db, 'warehouses', warehouseId));
    if (!warehouseDoc.exists()) {
      throw new Error('المخزن غير موجود');
    }

    const warehouseData = warehouseDoc.data();

    // حذف الحساب الفرعي إذا كان موجوداً
    if (warehouseData.subAccountId) {
      await deleteAccount(warehouseData.subAccountId);
    }

    // حذف المخزن
    await deleteDoc(doc(db, 'warehouses', warehouseId));
  } catch (error) {
    console.error('Error deleting warehouse with sub account:', error);
    throw error;
  }
};

// جلب جميع المخازن
export const fetchWarehouses = async (): Promise<Warehouse[]> => {
  try {
    const warehousesSnapshot = await getDocs(
      query(
        collection(db, 'warehouses'),
        orderBy('createdAt', 'desc')
      )
    );

    const warehouses = warehousesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Warehouse[];

    return warehouses;
  } catch (error) {
    console.error('Error fetching warehouses:', error);
    throw error;
  }
};

// جلب مخازن فرع معين
export const fetchWarehousesByBranch = async (branchId: string): Promise<Warehouse[]> => {
  try {
    const warehousesSnapshot = await getDocs(
      query(
        collection(db, 'warehouses'),
        where('branch', '==', branchId),
        orderBy('createdAt', 'desc')
      )
    );

    const warehouses = warehousesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Warehouse[];

    return warehouses;
  } catch (error) {
    console.error('Error fetching warehouses by branch:', error);
    throw error;
  }
};

// جلب المخازن النشطة فقط
export const fetchActiveWarehouses = async (): Promise<Warehouse[]> => {
  try {
    const warehousesSnapshot = await getDocs(
      query(
        collection(db, 'warehouses'),
        where('status', '==', 'active'),
        orderBy('createdAt', 'desc')
      )
    );

    const warehouses = warehousesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Warehouse[];

    return warehouses;
  } catch (error) {
    console.error('Error fetching active warehouses:', error);
    throw error;
  }
};

// جلب مخزن واحد
export const fetchWarehouseById = async (warehouseId: string): Promise<Warehouse | null> => {
  try {
    const warehouseDoc = await getDoc(doc(db, 'warehouses', warehouseId));
    
    if (!warehouseDoc.exists()) {
      return null;
    }

    return {
      id: warehouseDoc.id,
      ...warehouseDoc.data()
    } as Warehouse;
  } catch (error) {
    console.error('Error fetching warehouse by id:', error);
    throw error;
  }
};

// جلب المخازن المسموح للمستخدم بالوصول إليها
export const fetchWarehousesByUser = async (userId: string): Promise<Warehouse[]> => {
  try {
    const warehousesSnapshot = await getDocs(
      query(
        collection(db, 'warehouses'),
        where('allowedUsers', 'array-contains', userId),
        where('status', '==', 'active')
      )
    );

    const warehouses = warehousesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Warehouse[];

    return warehouses;
  } catch (error) {
    console.error('Error fetching warehouses by user:', error);
    throw error;
  }
};

// جلب المخازن حسب نوع العملية
export const fetchWarehousesByOperationType = async (
  operationType: 'invoice' | 'warehouse',
  subType?: string
): Promise<Warehouse[]> => {
  try {
    const warehousesQuery = query(
      collection(db, 'warehouses'),
      where('documentType', '==', operationType),
      where('status', '==', 'active')
    );

    const warehousesSnapshot = await getDocs(warehousesQuery);

    let warehouses = warehousesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Warehouse[];

    // تصفية إضافية حسب النوع الفرعي
    if (subType) {
      warehouses = warehouses.filter(warehouse => {
        if (operationType === 'invoice') {
          return warehouse.invoiceTypes?.includes(subType) || warehouse.invoiceTypes?.includes('all');
        } else if (operationType === 'warehouse') {
          return warehouse.warehouseOperations?.includes(subType);
        }
        return false;
      });
    }

    return warehouses;
  } catch (error) {
    console.error('Error fetching warehouses by operation type:', error);
    throw error;
  }
};
