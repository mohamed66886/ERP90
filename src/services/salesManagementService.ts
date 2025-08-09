import { db } from '@/lib/firebase';
import { 
  collection, 
  getDocs, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  query,
  where 
} from 'firebase/firestore';

// Types
export interface SalesRepresentative {
  id?: string;
  name: string;
  email: string;
  phone: string;
  branch: string;
  branchName?: string;
  department: string;
  position: string;
  hireDate: string;
  status: 'active' | 'inactive';
  avatar?: string;
  address?: string;
  notes?: string;
  commissionRate?: number;
  salary?: number;
  targetAmount?: number;
  currentSales?: number;
  uid?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SalesTarget {
  id?: string;
  representativeId: string;
  representativeName: string;
  targetType: 'monthly' | 'quarterly' | 'yearly';
  targetPeriod: string;
  targetAmount: number;
  achievedAmount?: number;
  actualProgress?: number;
  progressPercentage?: number;
  targetQuantity?: number;
  achievedQuantity?: number;
  status: 'pending' | 'in_progress' | 'achieved' | 'missed' | 'active' | 'completed' | 'expired';
  startDate: string;
  endDate: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Commission {
  id?: string;
  representativeId: string;
  representativeName: string;
  salesPeriod: string;
  totalSales: number;
  commissionRate: number;
  commissionAmount: number;
  bonusAmount?: number;
  deductions?: number;
  finalAmount: number;
  status: 'pending' | 'approved' | 'paid';
  paymentDate?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PerformanceData {
  representativeId: string;
  representativeName: string;
  avatar?: string;
  totalSales: number;
  targetsAchieved: number;
  totalTargets: number;
  commissionEarned: number;
  customersSigned: number;
  averageOrderValue: number;
  performanceScore: number;
  rating: number;
  status: 'excellent' | 'good' | 'average' | 'poor';
  period: string;
}

// Sales Representatives Service
export class SalesRepresentativeService {
  static async getAll(): Promise<SalesRepresentative[]> {
    const snapshot = await getDocs(collection(db, 'salesRepresentatives'));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SalesRepresentative));
  }

  static async getById(id: string): Promise<SalesRepresentative | null> {
    const snapshot = await getDocs(query(collection(db, 'salesRepresentatives'), where('id', '==', id)));
    if (!snapshot.empty) {
      const doc = snapshot.docs[0];
      return { id: doc.id, ...doc.data() } as SalesRepresentative;
    }
    return null;
  }

  static async create(data: Omit<SalesRepresentative, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'salesRepresentatives'), {
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return docRef.id;
  }

  static async update(id: string, data: Partial<SalesRepresentative>): Promise<void> {
    await updateDoc(doc(db, 'salesRepresentatives', id), {
      ...data,
      updatedAt: new Date()
    });
  }

  static async delete(id: string): Promise<void> {
    await deleteDoc(doc(db, 'salesRepresentatives', id));
  }

  static async getByBranch(branchId: string): Promise<SalesRepresentative[]> {
    const snapshot = await getDocs(query(
      collection(db, 'salesRepresentatives'), 
      where('branch', '==', branchId)
    ));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SalesRepresentative));
  }
}

// Sales Targets Service
export class SalesTargetService {
  static async getAll(): Promise<SalesTarget[]> {
    const snapshot = await getDocs(collection(db, 'salesTargets'));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SalesTarget));
  }

  static async getByRepresentative(representativeId: string): Promise<SalesTarget[]> {
    const snapshot = await getDocs(query(
      collection(db, 'salesTargets'), 
      where('representativeId', '==', representativeId)
    ));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SalesTarget));
  }

  static async create(data: Omit<SalesTarget, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'salesTargets'), {
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return docRef.id;
  }

  static async update(id: string, data: Partial<SalesTarget>): Promise<void> {
    await updateDoc(doc(db, 'salesTargets', id), {
      ...data,
      updatedAt: new Date()
    });
  }

  static async delete(id: string): Promise<void> {
    await deleteDoc(doc(db, 'salesTargets', id));
  }
}

// Sales Commissions Service
export class SalesCommissionService {
  static async getAll(): Promise<Commission[]> {
    const snapshot = await getDocs(collection(db, 'salesCommissions'));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Commission));
  }

  static async getByRepresentative(representativeId: string): Promise<Commission[]> {
    const snapshot = await getDocs(query(
      collection(db, 'salesCommissions'), 
      where('representativeId', '==', representativeId)
    ));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Commission));
  }

  static async create(data: Omit<Commission, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'salesCommissions'), {
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return docRef.id;
  }

  static async update(id: string, data: Partial<Commission>): Promise<void> {
    await updateDoc(doc(db, 'salesCommissions', id), {
      ...data,
      updatedAt: new Date()
    });
  }

  static async delete(id: string): Promise<void> {
    await deleteDoc(doc(db, 'salesCommissions', id));
  }

  static calculateCommission(totalSales: number, commissionRate: number, bonusAmount = 0, deductions = 0): number {
    const commissionAmount = (totalSales * commissionRate) / 100;
    return commissionAmount + bonusAmount - deductions;
  }
}

// Performance Evaluation Service
export class PerformanceEvaluationService {
  static async calculatePerformanceData(representatives: SalesRepresentative[]): Promise<PerformanceData[]> {
    // Load sales data
    const salesSnapshot = await getDocs(collection(db, 'sales_invoices'));
    const commissionsSnapshot = await getDocs(collection(db, 'salesCommissions'));
    const targetsSnapshot = await getDocs(collection(db, 'salesTargets'));

    const performanceByRep: {[key: string]: PerformanceData} = {};

    // Initialize performance data for each representative
    representatives.forEach(rep => {
      performanceByRep[rep.id!] = {
        representativeId: rep.id!,
        representativeName: rep.name,
        avatar: rep.avatar,
        totalSales: 0,
        targetsAchieved: 0,
        totalTargets: 0,
        commissionEarned: 0,
        customersSigned: 0,
        averageOrderValue: 0,
        performanceScore: 0,
        rating: 3,
        status: 'average',
        period: 'الفترة الحالية'
      };
    });

    // Calculate sales data
    const salesByRep: {[key: string]: {total: number, orders: number, customers: Set<string>}} = {};
    salesSnapshot.docs.forEach(doc => {
      const data = doc.data();
      const repId = data.delegate || data.representativeId;
      const customerName = data.customerName;
      
      if (repId && performanceByRep[repId]) {
        if (!salesByRep[repId]) {
          salesByRep[repId] = { total: 0, orders: 0, customers: new Set() };
        }
        
        salesByRep[repId].total += data.totals?.total || 0;
        salesByRep[repId].orders += 1;
        
        if (customerName) {
          salesByRep[repId].customers.add(customerName);
        }
      }
    });

    // Update performance data with sales information
    Object.keys(salesByRep).forEach(repId => {
      const salesData = salesByRep[repId];
      if (performanceByRep[repId]) {
        performanceByRep[repId].totalSales = salesData.total;
        performanceByRep[repId].customersSigned = salesData.customers.size;
        performanceByRep[repId].averageOrderValue = salesData.orders > 0 ? salesData.total / salesData.orders : 0;
      }
    });

    // Calculate commissions
    commissionsSnapshot.docs.forEach(doc => {
      const data = doc.data();
      const repId = data.representativeId;
      
      if (repId && performanceByRep[repId]) {
        performanceByRep[repId].commissionEarned += data.finalAmount || 0;
      }
    });

    // Calculate targets
    targetsSnapshot.docs.forEach(doc => {
      const data = doc.data();
      const repId = data.representativeId;
      
      if (repId && performanceByRep[repId]) {
        performanceByRep[repId].totalTargets += 1;
        if (data.status === 'achieved') {
          performanceByRep[repId].targetsAchieved += 1;
        }
      }
    });

    // Calculate performance scores and ratings
    Object.keys(performanceByRep).forEach(repId => {
      const data = performanceByRep[repId];
      
      // Performance score based on target achievement and sales
      const targetScore = data.totalTargets > 0 ? (data.targetsAchieved / data.totalTargets) * 50 : 0;
      const salesScore = Math.min((data.totalSales / 100000) * 30, 30); // Scale based on 100k target
      const customerScore = Math.min(data.customersSigned * 2, 20); // 2 points per customer, max 20
      
      data.performanceScore = Math.round(targetScore + salesScore + customerScore);
      
      // Rating based on performance score
      if (data.performanceScore >= 80) {
        data.rating = 5;
        data.status = 'excellent';
      } else if (data.performanceScore >= 65) {
        data.rating = 4;
        data.status = 'good';
      } else if (data.performanceScore >= 50) {
        data.rating = 3;
        data.status = 'average';
      } else {
        data.rating = 2;
        data.status = 'poor';
      }
    });

    return Object.values(performanceByRep);
  }
}

// Analytics and Reports Service
export class SalesAnalyticsService {
  static async getTotalSalesByRepresentative(): Promise<{[key: string]: number}> {
    const salesSnapshot = await getDocs(collection(db, 'sales_invoices'));
    const salesByRep: {[key: string]: number} = {};

    salesSnapshot.docs.forEach(doc => {
      const data = doc.data();
      const repId = data.delegate || data.representativeId;
      const total = data.totals?.total || 0;

      if (repId) {
        salesByRep[repId] = (salesByRep[repId] || 0) + total;
      }
    });

    return salesByRep;
  }

  static async getTopPerformers(limit = 5): Promise<PerformanceData[]> {
    const representatives = await SalesRepresentativeService.getAll();
    const performanceData = await PerformanceEvaluationService.calculatePerformanceData(representatives);
    
    return performanceData
      .sort((a, b) => b.performanceScore - a.performanceScore)
      .slice(0, limit);
  }

  static async getCommissionSummary(): Promise<{
    totalCommissions: number;
    pendingCommissions: number;
    paidCommissions: number;
    avgCommissionRate: number;
  }> {
    const commissionsSnapshot = await getDocs(collection(db, 'salesCommissions'));
    const commissions = commissionsSnapshot.docs.map(doc => doc.data());
    
    const totalCommissions = commissions.reduce((sum, c) => sum + (c.finalAmount || 0), 0);
    const pendingCommissions = commissions
      .filter(c => c.status === 'pending')
      .reduce((sum, c) => sum + (c.finalAmount || 0), 0);
    const paidCommissions = commissions
      .filter(c => c.status === 'paid')
      .reduce((sum, c) => sum + (c.finalAmount || 0), 0);
    const avgCommissionRate = commissions.length > 0 
      ? commissions.reduce((sum, c) => sum + (c.commissionRate || 0), 0) / commissions.length 
      : 0;

    return {
      totalCommissions,
      pendingCommissions,
      paidCommissions,
      avgCommissionRate
    };
  }
}
