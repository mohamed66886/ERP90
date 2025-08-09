import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy, 
  where 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface Customer {
  id: string;
  nameAr: string;
  nameEn: string;
  branch: string;
  commercialReg: string;
  regDate: string;
  regAuthority: string;
  businessType: string;
  activity: string;
  startDate: string;
  city: string;
  creditLimit: string;
  region: string;
  district: string;
  street: string;
  buildingNo: string;
  postalCode: string;
  countryCode: string;
  phone: string;
  mobile: string;
  email: string;
  status: "نشط" | "متوقف";
  category?: "VIP" | "ذهبي" | "فضي" | "عادي";
  priority?: "عالي" | "متوسط" | "منخفض";
  taxFileNumber?: string;
  taxFileExpiry?: string;
  lastContactDate?: string;
  nextFollowUpDate?: string;
  customerNotes?: string;
  createdAt?: string;
  lastStatusUpdate?: string;
  lastCategoryUpdate?: string;
  lastPriorityUpdate?: string;
  lastFollowUpUpdate?: string;
  docId?: string;
}

export interface FollowUpRecord {
  id?: string;
  customerId: string;
  customerName: string;
  contactType: "مكالمة" | "بريد إلكتروني" | "زيارة" | "رسالة";
  contactDate: string;
  nextFollowUpDate?: string;
  notes: string;
  status: "مكتمل" | "مجدول" | "متأخر";
  createdBy: string;
  createdAt: string;
}

// جلب جميع العملاء
export const getAllCustomers = async (): Promise<Customer[]> => {
  try {
    const q = query(collection(db, "customers"), orderBy("id", "asc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ 
      ...doc.data() as Customer, 
      docId: doc.id 
    }));
  } catch (error) {
    console.error("Error fetching customers:", error);
    throw error;
  }
};

// إضافة عميل جديد
export const createCustomer = async (customerData: Omit<Customer, 'id' | 'docId'>): Promise<string> => {
  try {
    // احتساب رقم العميل الجديد
    const existingCustomers = await getAllCustomers();
    const maxNum = existingCustomers
      .map(c => {
        const match = /^c-(\d{4})$/.exec(c.id);
        return match ? parseInt(match[1], 10) : 0;
      })
      .reduce((a, b) => Math.max(a, b), 0);
    
    const nextNum = maxNum + 1;
    const newId = `c-${nextNum.toString().padStart(4, '0')}`;

    const docRef = await addDoc(collection(db, "customers"), {
      ...customerData,
      id: newId,
      createdAt: new Date().toISOString()
    });

    return docRef.id;
  } catch (error) {
    console.error("Error creating customer:", error);
    throw error;
  }
};

// تحديث بيانات عميل
export const updateCustomer = async (customerId: string, customerData: Partial<Customer>): Promise<void> => {
  try {
    const { docId, ...updateData } = customerData;
    await updateDoc(doc(db, "customers", customerId), {
      ...updateData,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error updating customer:", error);
    throw error;
  }
};

// حذف عميل
export const deleteCustomer = async (customerId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, "customers", customerId));
  } catch (error) {
    console.error("Error deleting customer:", error);
    throw error;
  }
};

// تحديث حالة العميل
export const updateCustomerStatus = async (customerId: string, status: "نشط" | "متوقف"): Promise<void> => {
  try {
    await updateDoc(doc(db, "customers", customerId), {
      status,
      lastStatusUpdate: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error updating customer status:", error);
    throw error;
  }
};

// تحديث تصنيف العميل
export const updateCustomerCategory = async (customerId: string, category: "VIP" | "ذهبي" | "فضي" | "عادي"): Promise<void> => {
  try {
    await updateDoc(doc(db, "customers", customerId), {
      category,
      lastCategoryUpdate: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error updating customer category:", error);
    throw error;
  }
};

// تحديث أولوية العميل
export const updateCustomerPriority = async (customerId: string, priority: "عالي" | "متوسط" | "منخفض"): Promise<void> => {
  try {
    await updateDoc(doc(db, "customers", customerId), {
      priority,
      lastPriorityUpdate: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error updating customer priority:", error);
    throw error;
  }
};

// جلب سجلات المتابعة
export const getFollowUpRecords = async (customerId?: string): Promise<FollowUpRecord[]> => {
  try {
    let q = query(collection(db, "customerFollowUps"), orderBy("contactDate", "desc"));
    
    if (customerId) {
      q = query(collection(db, "customerFollowUps"), where("customerId", "==", customerId), orderBy("contactDate", "desc"));
    }
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ 
      ...doc.data() as FollowUpRecord, 
      id: doc.id 
    }));
  } catch (error) {
    console.error("Error fetching follow-up records:", error);
    throw error;
  }
};

// إضافة سجل متابعة
export const createFollowUpRecord = async (followUpData: Omit<FollowUpRecord, 'id'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, "customerFollowUps"), {
      ...followUpData,
      createdAt: new Date().toISOString()
    });

    // تحديث تاريخ آخر اتصال للعميل
    await updateDoc(doc(db, "customers", followUpData.customerId), {
      lastContactDate: followUpData.contactDate,
      nextFollowUpDate: followUpData.nextFollowUpDate,
      lastFollowUpUpdate: new Date().toISOString()
    });

    return docRef.id;
  } catch (error) {
    console.error("Error creating follow-up record:", error);
    throw error;
  }
};

// تصنيف تلقائي للعملاء بناءً على الحد الائتماني
export const autoClassifyCustomers = async (): Promise<void> => {
  try {
    const customers = await getAllCustomers();
    
    const updates = customers.map(customer => {
      if (!customer.docId) return Promise.resolve();
      
      const creditLimit = parseFloat(customer.creditLimit) || 0;
      let category: "VIP" | "ذهبي" | "فضي" | "عادي";
      let priority: "عالي" | "متوسط" | "منخفض";
      
      // تصنيف بناءً على الحد الائتماني
      if (creditLimit >= 1000000) {
        category = "VIP";
        priority = "عالي";
      } else if (creditLimit >= 500000) {
        category = "ذهبي";
        priority = "عالي";
      } else if (creditLimit >= 100000) {
        category = "فضي";
        priority = "متوسط";
      } else {
        category = "عادي";
        priority = "منخفض";
      }
      
      return updateDoc(doc(db, "customers", customer.docId), {
        category,
        priority,
        lastAutoClassification: new Date().toISOString()
      });
    });
    
    await Promise.all(updates);
  } catch (error) {
    console.error("Error auto-classifying customers:", error);
    throw error;
  }
};

// تحويل الاسم العربي إلى إنجليزي
export const arabicToEnglish = (text: string): string => {
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

// إحصائيات العملاء
export const getCustomersStats = (customers: Customer[]) => {
  const totalCustomers = customers.length;
  const activeCustomers = customers.filter(c => c.status === "نشط").length;
  const inactiveCustomers = customers.filter(c => c.status === "متوقف").length;
  
  const categoryStats = {
    VIP: customers.filter(c => c.category === "VIP").length,
    golden: customers.filter(c => c.category === "ذهبي").length,
    silver: customers.filter(c => c.category === "فضي").length,
    regular: customers.filter(c => c.category === "عادي").length,
  };
  
  const priorityStats = {
    high: customers.filter(c => c.priority === "عالي").length,
    medium: customers.filter(c => c.priority === "متوسط").length,
    low: customers.filter(c => c.priority === "منخفض").length,
  };
  
  const cityStats = customers.reduce((acc, customer) => {
    acc[customer.city] = (acc[customer.city] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const topCity = Object.entries(cityStats)
    .sort(([,a], [,b]) => b - a)[0]?.[0] || "غير محدد";
  
  return {
    totalCustomers,
    activeCustomers,
    inactiveCustomers,
    activationRate: totalCustomers > 0 ? Math.round((activeCustomers / totalCustomers) * 100) : 0,
    categoryStats,
    priorityStats,
    cityStats,
    topCity
  };
};
