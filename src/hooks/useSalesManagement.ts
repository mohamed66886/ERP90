import { useState, useEffect, useCallback } from 'react';
import { message } from 'antd';
import { 
  SalesRepresentativeService, 
  SalesTargetService, 
  SalesCommissionService,
  PerformanceEvaluationService,
  SalesAnalyticsService,
  type SalesRepresentative,
  type SalesTarget,
  type Commission,
  type PerformanceData
} from '@/services/salesManagementService';

// Hook for managing sales representatives
export const useSalesRepresentatives = () => {
  const [representatives, setRepresentatives] = useState<SalesRepresentative[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadRepresentatives = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await SalesRepresentativeService.getAll();
      setRepresentatives(data);
    } catch (err) {
      const errorMessage = 'حدث خطأ في تحميل بيانات المندوبين';
      setError(errorMessage);
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const createRepresentative = useCallback(async (data: Omit<SalesRepresentative, 'id'>) => {
    setLoading(true);
    try {
      const id = await SalesRepresentativeService.create(data);
      await loadRepresentatives();
      message.success('تم إضافة المندوب بنجاح');
      return id;
    } catch (err) {
      message.error('حدث خطأ في إضافة المندوب');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadRepresentatives]);

  const updateRepresentative = useCallback(async (id: string, data: Partial<SalesRepresentative>) => {
    setLoading(true);
    try {
      await SalesRepresentativeService.update(id, data);
      await loadRepresentatives();
      message.success('تم تحديث بيانات المندوب بنجاح');
    } catch (err) {
      message.error('حدث خطأ في تحديث المندوب');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadRepresentatives]);

  const deleteRepresentative = useCallback(async (id: string) => {
    setLoading(true);
    try {
      await SalesRepresentativeService.delete(id);
      await loadRepresentatives();
      message.success('تم حذف المندوب بنجاح');
    } catch (err) {
      message.error('حدث خطأ في حذف المندوب');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadRepresentatives]);

  useEffect(() => {
    loadRepresentatives();
  }, [loadRepresentatives]);

  return {
    representatives,
    loading,
    error,
    loadRepresentatives,
    createRepresentative,
    updateRepresentative,
    deleteRepresentative
  };
};

// Hook for managing sales targets
export const useSalesTargets = (representativeId?: string) => {
  const [targets, setTargets] = useState<SalesTarget[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTargets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = representativeId 
        ? await SalesTargetService.getByRepresentative(representativeId)
        : await SalesTargetService.getAll();
      setTargets(data);
    } catch (err) {
      const errorMessage = 'حدث خطأ في تحميل بيانات الأهداف';
      setError(errorMessage);
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [representativeId]);

  const createTarget = useCallback(async (data: Omit<SalesTarget, 'id'>) => {
    setLoading(true);
    try {
      const id = await SalesTargetService.create(data);
      await loadTargets();
      message.success('تم إضافة الهدف بنجاح');
      return id;
    } catch (err) {
      message.error('حدث خطأ في إضافة الهدف');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadTargets]);

  const updateTarget = useCallback(async (id: string, data: Partial<SalesTarget>) => {
    setLoading(true);
    try {
      await SalesTargetService.update(id, data);
      await loadTargets();
      message.success('تم تحديث الهدف بنجاح');
    } catch (err) {
      message.error('حدث خطأ في تحديث الهدف');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadTargets]);

  const deleteTarget = useCallback(async (id: string) => {
    setLoading(true);
    try {
      await SalesTargetService.delete(id);
      await loadTargets();
      message.success('تم حذف الهدف بنجاح');
    } catch (err) {
      message.error('حدث خطأ في حذف الهدف');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadTargets]);

  useEffect(() => {
    loadTargets();
  }, [loadTargets]);

  return {
    targets,
    loading,
    error,
    loadTargets,
    createTarget,
    updateTarget,
    deleteTarget
  };
};

// Hook for managing sales commissions
export const useSalesCommissions = (representativeId?: string) => {
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCommissions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = representativeId 
        ? await SalesCommissionService.getByRepresentative(representativeId)
        : await SalesCommissionService.getAll();
      setCommissions(data);
    } catch (err) {
      const errorMessage = 'حدث خطأ في تحميل بيانات العمولات';
      setError(errorMessage);
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [representativeId]);

  const createCommission = useCallback(async (data: Omit<Commission, 'id'>) => {
    setLoading(true);
    try {
      const id = await SalesCommissionService.create(data);
      await loadCommissions();
      message.success('تم إضافة العمولة بنجاح');
      return id;
    } catch (err) {
      message.error('حدث خطأ في إضافة العمولة');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadCommissions]);

  const updateCommission = useCallback(async (id: string, data: Partial<Commission>) => {
    setLoading(true);
    try {
      await SalesCommissionService.update(id, data);
      await loadCommissions();
      message.success('تم تحديث العمولة بنجاح');
    } catch (err) {
      message.error('حدث خطأ في تحديث العمولة');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadCommissions]);

  const deleteCommission = useCallback(async (id: string) => {
    setLoading(true);
    try {
      await SalesCommissionService.delete(id);
      await loadCommissions();
      message.success('تم حذف العمولة بنجاح');
    } catch (err) {
      message.error('حدث خطأ في حذف العمولة');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadCommissions]);

  const calculateCommission = useCallback((totalSales: number, commissionRate: number, bonusAmount = 0, deductions = 0) => {
    return SalesCommissionService.calculateCommission(totalSales, commissionRate, bonusAmount, deductions);
  }, []);

  useEffect(() => {
    loadCommissions();
  }, [loadCommissions]);

  return {
    commissions,
    loading,
    error,
    loadCommissions,
    createCommission,
    updateCommission,
    deleteCommission,
    calculateCommission
  };
};

// Hook for performance evaluation
export const usePerformanceEvaluation = () => {
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPerformanceData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const representatives = await SalesRepresentativeService.getAll();
      const data = await PerformanceEvaluationService.calculatePerformanceData(representatives);
      setPerformanceData(data);
    } catch (err) {
      const errorMessage = 'حدث خطأ في تحميل بيانات الأداء';
      setError(errorMessage);
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPerformanceData();
  }, [loadPerformanceData]);

  return {
    performanceData,
    loading,
    error,
    loadPerformanceData
  };
};

// Hook for sales analytics
export const useSalesAnalytics = () => {
  const [totalSalesByRep, setTotalSalesByRep] = useState<{[key: string]: number}>({});
  const [topPerformers, setTopPerformers] = useState<PerformanceData[]>([]);
  const [commissionSummary, setCommissionSummary] = useState<{
    totalCommissions: number;
    pendingCommissions: number;
    paidCommissions: number;
    avgCommissionRate: number;
  }>({
    totalCommissions: 0,
    pendingCommissions: 0,
    paidCommissions: 0,
    avgCommissionRate: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [salesByRep, performers, commSummary] = await Promise.all([
        SalesAnalyticsService.getTotalSalesByRepresentative(),
        SalesAnalyticsService.getTopPerformers(),
        SalesAnalyticsService.getCommissionSummary()
      ]);

      setTotalSalesByRep(salesByRep);
      setTopPerformers(performers);
      setCommissionSummary(commSummary);
    } catch (err) {
      const errorMessage = 'حدث خطأ في تحميل بيانات التحليلات';
      setError(errorMessage);
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  return {
    totalSalesByRep,
    topPerformers,
    commissionSummary,
    loading,
    error,
    loadAnalytics
  };
};

// Hook for filtering and searching
export const useSearchAndFilter = <T>(
  data: T[],
  searchFields: (keyof T)[],
  filterFunctions?: Array<(item: T) => boolean>
) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredData, setFilteredData] = useState<T[]>(data);

  useEffect(() => {
    let filtered = data;

    // Apply search
    if (searchTerm) {
      filtered = filtered.filter(item =>
        searchFields.some(field => {
          const value = item[field];
          return value && 
            String(value).toLowerCase().includes(searchTerm.toLowerCase());
        })
      );
    }

    // Apply additional filters
    if (filterFunctions) {
      filtered = filtered.filter(item =>
        filterFunctions.every(filterFn => filterFn(item))
      );
    }

    setFilteredData(filtered);
  }, [data, searchTerm, searchFields, filterFunctions]);

  return {
    searchTerm,
    setSearchTerm,
    filteredData
  };
};
