// Firebase implementation of costCenterService.ts
import { db } from './firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';

export interface CostCenter {
  id: string;
  code: string;
  nameAr: string;
  nameEn: string;
  description?: string;
  type: 'رئيسي' | 'فرعي' | 'وحدة';
  level: number;
  parentId?: string;
  children?: CostCenter[];
  status: 'نشط' | 'غير نشط';
  hasSubCenters: boolean;
  manager?: string;
  department?: string;
  location?: string;
  budget?: number;
  actualCost?: number;
  variance?: number;
  startDate?: string;
  endDate?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Get all cost centers from Firebase
export const getCostCenters = async (): Promise<CostCenter[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, 'costCenters'));
    const costCenters = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as CostCenter));
    
    console.log('Cost centers loaded from Firebase:', costCenters.length);
    return costCenters;
  } catch (error) {
    console.error('Error fetching cost centers:', error);
    throw error;
  }
};

// Add new cost center to Firebase
export const addCostCenter = async (costCenter: Omit<CostCenter, 'id'>): Promise<void> => {
  try {
    const costCenterWithTimestamp = {
      ...costCenter,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    await addDoc(collection(db, 'costCenters'), costCenterWithTimestamp);
    console.log('Cost center added successfully');
  } catch (error) {
    console.error('Error adding cost center:', error);
    throw error;
  }
};

// Update cost center in Firebase
export const updateCostCenter = async (id: string, updates: Partial<CostCenter>): Promise<void> => {
  try {
    const updatesWithTimestamp = {
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    await updateDoc(doc(db, 'costCenters', id), updatesWithTimestamp);
    console.log('Cost center updated successfully');
  } catch (error) {
    console.error('Error updating cost center:', error);
    throw error;
  }
};

// Delete cost center from Firebase
export const deleteCostCenter = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'costCenters', id));
    console.log('Cost center deleted successfully');
  } catch (error) {
    console.error('Error deleting cost center:', error);
    throw error;
  }
};

// Generate default cost centers data
export const getDefaultCostCenters = (): Omit<CostCenter, 'id'>[] => {
  return [
    {
      code: '100',
      nameAr: 'الإدارة العامة',
      nameEn: 'General Administration',
      description: 'مركز تكلفة الإدارة العامة',
      type: 'رئيسي',
      level: 1,
      status: 'نشط',
      hasSubCenters: true,
      department: 'الإدارة',
      budget: 100000,
      actualCost: 0,
      variance: 0
    },
    {
      code: '101',
      nameAr: 'إدارة الموارد البشرية',
      nameEn: 'Human Resources',
      description: 'مركز تكلفة الموارد البشرية',
      type: 'فرعي',
      level: 2,
      parentId: '100',
      status: 'نشط',
      hasSubCenters: false,
      department: 'الموارد البشرية',
      budget: 30000,
      actualCost: 0,
      variance: 0
    },
    {
      code: '102',
      nameAr: 'الإدارة المالية',
      nameEn: 'Financial Administration',
      description: 'مركز تكلفة الإدارة المالية',
      type: 'فرعي',
      level: 2,
      parentId: '100',
      status: 'نشط',
      hasSubCenters: true,
      department: 'المالية',
      budget: 40000,
      actualCost: 0,
      variance: 0
    },
    {
      code: '200',
      nameAr: 'الإنتاج',
      nameEn: 'Production',
      description: 'مركز تكلفة الإنتاج',
      type: 'رئيسي',
      level: 1,
      status: 'نشط',
      hasSubCenters: true,
      department: 'الإنتاج',
      budget: 500000,
      actualCost: 0,
      variance: 0
    },
    {
      code: '201',
      nameAr: 'خط الإنتاج الأول',
      nameEn: 'Production Line 1',
      description: 'مركز تكلفة خط الإنتاج الأول',
      type: 'فرعي',
      level: 2,
      parentId: '200',
      status: 'نشط',
      hasSubCenters: false,
      department: 'الإنتاج',
      budget: 250000,
      actualCost: 0,
      variance: 0
    },
    {
      code: '202',
      nameAr: 'خط الإنتاج الثاني',
      nameEn: 'Production Line 2',
      description: 'مركز تكلفة خط الإنتاج الثاني',
      type: 'فرعي',
      level: 2,
      parentId: '200',
      status: 'نشط',
      hasSubCenters: false,
      department: 'الإنتاج',
      budget: 250000,
      actualCost: 0,
      variance: 0
    },
    {
      code: '300',
      nameAr: 'المبيعات',
      nameEn: 'Sales',
      description: 'مركز تكلفة المبيعات',
      type: 'رئيسي',
      level: 1,
      status: 'نشط',
      hasSubCenters: true,
      department: 'المبيعات',
      budget: 200000,
      actualCost: 0,
      variance: 0
    },
    {
      code: '301',
      nameAr: 'المبيعات المحلية',
      nameEn: 'Local Sales',
      description: 'مركز تكلفة المبيعات المحلية',
      type: 'فرعي',
      level: 2,
      parentId: '300',
      status: 'نشط',
      hasSubCenters: false,
      department: 'المبيعات',
      budget: 120000,
      actualCost: 0,
      variance: 0
    },
    {
      code: '302',
      nameAr: 'التصدير',
      nameEn: 'Export Sales',
      description: 'مركز تكلفة التصدير',
      type: 'فرعي',
      level: 2,
      parentId: '300',
      status: 'نشط',
      hasSubCenters: false,
      department: 'المبيعات',
      budget: 80000,
      actualCost: 0,
      variance: 0
    }
  ];
};
