import { useState, useEffect, useCallback, useMemo } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { fetchCashBoxes } from '@/services/cashBoxesService';
import { fetchBankAccounts } from '@/services/bankAccountsService';

// Types
interface InventoryItem {
  id: string;
  name: string;
  itemCode?: string;
  salePrice?: number;
  discount?: number;
  isVatIncluded?: boolean;
  type?: string;
  tempCodes?: boolean;
  allowNegative?: boolean;
}

interface Branch {
  id: string;
  name?: string;
  code?: string;
  number?: string;
  branchNumber?: string;
}

interface Warehouse {
  id: string;
  name?: string;
}

interface PaymentMethod {
  id: string;
  name?: string;
  value?: string;
}

interface Customer {
  id: string;
  nameAr?: string;
  nameEn?: string;
  name?: string;
  phone?: string;
  phoneNumber?: string;
  mobile?: string;
  commercialReg?: string;
  taxFile?: string;
}

interface Delegate {
  id: string;
  name?: string;
  email?: string;
}

interface CashBox {
  id?: string;
  nameAr: string;
  branch?: string;
}

interface Bank {
  id?: string;
  name?: string;
  accountNumber?: string;
}

interface CompanyData {
  taxRate?: string;
}

// Custom hook for sales data
export const useSalesData = () => {
  // Loading states
  const [loading, setLoading] = useState(false);
  const [fetchingItems, setFetchingItems] = useState(false);
  const [loadingStocks, setLoadingStocks] = useState(false);

  // Data states
  const [delegates, setDelegates] = useState<Delegate[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [cashBoxes, setCashBoxes] = useState<CashBox[]>([]);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [priceRules, setPriceRules] = useState<string[]>([]);
  const [units, setUnits] = useState<string[]>([]);
  const [itemNames, setItemNames] = useState<InventoryItem[]>([]);
  const [allItems, setAllItems] = useState<InventoryItem[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [companyData, setCompanyData] = useState<CompanyData>({});
  const [suppliers, setSuppliers] = useState<{ id: string; name: string }[]>([]);

  // Cache for fetched data
  const [dataCache, setDataCache] = useState<{
    lastFetch: number;
    data: any;
  } | null>(null);

  // Fetch company data
  const fetchCompanyData = useCallback(async () => {
    try {
      const companySnapshot = await getDocs(collection(db, 'company_settings'));
      if (!companySnapshot.empty) {
        const data = companySnapshot.docs[0].data();
        setCompanyData(data);
        return data.taxRate || '15';
      }
      return '15';
    } catch (error) {
      console.error('خطأ في جلب بيانات الشركة:', error);
      return '15';
    }
  }, []);

  // Fetch delegates
  const fetchDelegates = useCallback(async () => {
    try {
      const delegatesSnapshot = await getDocs(collection(db, 'sales_representatives'));
      const delegatesData = delegatesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Delegate[];
      setDelegates(delegatesData);
      return delegatesData;
    } catch (error) {
      console.error('خطأ في جلب المندوبين:', error);
      return [];
    }
  }, []);

  // Fetch branches
  const fetchBranches = useCallback(async () => {
    try {
      const branchesSnapshot = await getDocs(collection(db, 'branches'));
      const branchesData = branchesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Branch[];
      setBranches(branchesData);
      return branchesData;
    } catch (error) {
      console.error('خطأ في جلب الفروع:', error);
      return [];
    }
  }, []);

  // Fetch warehouses
  const fetchWarehouses = useCallback(async () => {
    try {
      const warehousesSnapshot = await getDocs(collection(db, 'warehouses'));
      const warehousesData = warehousesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Warehouse[];
      setWarehouses(warehousesData);
      return warehousesData;
    } catch (error) {
      console.error('خطأ في جلب المخازن:', error);
      return [];
    }
  }, []);

  // Fetch payment methods
  const fetchPaymentMethods = useCallback(async () => {
    try {
      const paymentMethodsSnapshot = await getDocs(collection(db, 'payment_methods'));
      const paymentMethodsData = paymentMethodsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as PaymentMethod[];
      setPaymentMethods(paymentMethodsData);
      return paymentMethodsData;
    } catch (error) {
      console.error('خطأ في جلب طرق الدفع:', error);
      return [];
    }
  }, []);

  // Fetch customers
  const fetchCustomers = useCallback(async () => {
    try {
      const customersSnapshot = await getDocs(collection(db, 'customers'));
      const customersData = customersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Customer[];
      setCustomers(customersData);
      return customersData;
    } catch (error) {
      console.error('خطأ في جلب العملاء:', error);
      return [];
    }
  }, []);

  // Fetch items with caching
  const fetchItems = useCallback(async (forceRefresh = false) => {
    // Check cache first
    const cacheExpiry = 5 * 60 * 1000; // 5 minutes
    if (!forceRefresh && dataCache && (Date.now() - dataCache.lastFetch) < cacheExpiry) {
      setItemNames(dataCache.data.itemNames);
      setAllItems(dataCache.data.allItems);
      return;
    }

    setFetchingItems(true);
    try {
      const inventorySnapshot = await getDocs(collection(db, 'inventory'));
      const inventoryData = inventorySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as InventoryItem[];

      const filteredItems = inventoryData.filter(item => 
        item.type === 'مستوى ثاني' && item.name && item.name.trim() !== ''
      );

      setItemNames(filteredItems);
      setAllItems(inventoryData);

      // Cache the data
      setDataCache({
        lastFetch: Date.now(),
        data: {
          itemNames: filteredItems,
          allItems: inventoryData
        }
      });
    } catch (error) {
      console.error('خطأ في جلب الأصناف:', error);
    } finally {
      setFetchingItems(false);
    }
  }, [dataCache]);

  // Fetch suppliers
  const fetchSuppliers = useCallback(async () => {
    try {
      const suppliersSnapshot = await getDocs(collection(db, 'suppliers'));
      const suppliersData = suppliersSnapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name || doc.data().nameAr || doc.id
      }));
      setSuppliers(suppliersData);
      return suppliersData;
    } catch (error) {
      console.error('خطأ في جلب الموردين:', error);
      return [];
    }
  }, []);

  // Fetch all basic data
  const fetchBasicData = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchCompanyData(),
        fetchDelegates(),
        fetchBranches(),
        fetchWarehouses(),
        fetchPaymentMethods(),
        fetchCustomers(),
        fetchSuppliers(),
        fetchItems()
      ]);

      // Fetch additional data
      const [cashBoxesData, banksData] = await Promise.all([
        fetchCashBoxes(),
        fetchBankAccounts()
      ]);
      
      setCashBoxes(cashBoxesData);
      setBanks(banksData);

      // Set static data
      setPriceRules(['سعر الشراء', 'سعر البيع', 'سعر التجزئة']);
      setUnits(['قطعة', 'كيلو', 'جرام', 'لتر', 'متر', 'علبة', 'كرتون', 'حبة']);

    } catch (error) {
      console.error('خطأ في جلب البيانات الأساسية:', error);
    } finally {
      setLoading(false);
    }
  }, [fetchCompanyData, fetchDelegates, fetchBranches, fetchWarehouses, fetchPaymentMethods, fetchCustomers, fetchSuppliers, fetchItems]);

  // Memoized values for expensive computations
  const memoizedData = useMemo(() => ({
    taxRate: companyData.taxRate || '15',
    hasData: branches.length > 0 && warehouses.length > 0,
    totalItems: itemNames.length,
    totalCustomers: customers.length
  }), [companyData.taxRate, branches.length, warehouses.length, itemNames.length, customers.length]);

  return {
    // Loading states
    loading,
    fetchingItems,
    loadingStocks,
    
    // Data
    delegates,
    branches,
    warehouses,
    paymentMethods,
    cashBoxes,
    banks,
    priceRules,
    units,
    itemNames,
    allItems,
    customers,
    companyData,
    suppliers,
    
    // Functions
    fetchBasicData,
    fetchItems,
    
    // Memoized values
    ...memoizedData,
    
    // Cache control
    refreshCache: () => fetchItems(true)
  };
};
