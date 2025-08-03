import { db } from './firebase';
import { 
  collection, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  startAt,
  endAt 
} from 'firebase/firestore';

// تعريف أنواع النتائج المختلفة
export interface SearchResult {
  id: string;
  type: 'invoice' | 'customer' | 'supplier' | 'item' | 'account' | 'branch' | 'warehouse' | 'return' | 'purchase' | 'delegate' | 'cashbox';
  title: string;
  subtitle?: string;
  description?: string;
  route: string;
  icon?: string;
  data?: Record<string, unknown>;
  relevanceScore?: number;
}

export interface SearchOptions {
  query: string;
  types?: SearchResult['type'][];
  limit?: number;
  includeRecentItems?: boolean;
}

class SearchService {
  private static instance: SearchService;
  private searchCache = new Map<string, SearchResult[]>();
  private readonly cacheTimeout = 5 * 60 * 1000; // 5 دقائق

  static getInstance(): SearchService {
    if (!SearchService.instance) {
      SearchService.instance = new SearchService();
    }
    return SearchService.instance;
  }

  // البحث الشامل في جميع الجداول
  async universalSearch(options: SearchOptions): Promise<SearchResult[]> {
    const { query: searchQuery, types, limit: searchLimit = 50 } = options;
    
    if (!searchQuery || searchQuery.trim().length < 2) {
      return this.getRecentItems();
    }

    const cacheKey = `${searchQuery}_${types?.join(',')}_${searchLimit}`;
    
    // التحقق من الكاش
    if (this.searchCache.has(cacheKey)) {
      const cached = this.searchCache.get(cacheKey)!;
      return cached;
    }

    const results: SearchResult[] = [];
    const searchTerm = searchQuery.toLowerCase().trim();

    try {
      // البحث في الفواتير إذا لم يتم تحديد نوع أو تم تحديد invoice
      if (!types || types.includes('invoice')) {
        const invoiceResults = await this.searchInvoices(searchTerm);
        results.push(...invoiceResults);
      }

      // البحث في العملاء
      if (!types || types.includes('customer')) {
        const customerResults = await this.searchCustomers(searchTerm);
        results.push(...customerResults);
      }

      // البحث في الموردين
      if (!types || types.includes('supplier')) {
        const supplierResults = await this.searchSuppliers(searchTerm);
        results.push(...supplierResults);
      }

      // البحث في الأصناف
      if (!types || types.includes('item')) {
        const itemResults = await this.searchItems(searchTerm);
        results.push(...itemResults);
      }

      // البحث في الحسابات
      if (!types || types.includes('account')) {
        const accountResults = await this.searchAccounts(searchTerm);
        results.push(...accountResults);
      }

      // البحث في الفروع
      if (!types || types.includes('branch')) {
        const branchResults = await this.searchBranches(searchTerm);
        results.push(...branchResults);
      }

      // البحث في المخازن
      if (!types || types.includes('warehouse')) {
        const warehouseResults = await this.searchWarehouses(searchTerm);
        results.push(...warehouseResults);
      }

      // البحث في مرتجعات المبيعات
      if (!types || types.includes('return')) {
        const returnResults = await this.searchReturns(searchTerm);
        results.push(...returnResults);
      }

      // البحث في فواتير المشتريات
      if (!types || types.includes('purchase')) {
        const purchaseResults = await this.searchPurchases(searchTerm);
        results.push(...purchaseResults);
      }

      // البحث في المندوبين
      if (!types || types.includes('delegate')) {
        const delegateResults = await this.searchDelegates(searchTerm);
        results.push(...delegateResults);
      }

      // البحث في الصناديق
      if (!types || types.includes('cashbox')) {
        const cashboxResults = await this.searchCashBoxes(searchTerm);
        results.push(...cashboxResults);
      }

      // ترتيب النتائج حسب الصلة
      const sortedResults = this.sortByRelevance(results, searchTerm)
        .slice(0, searchLimit);

      // حفظ في الكاش
      this.searchCache.set(cacheKey, sortedResults);
      
      // حذف الكاش بعد فترة زمنية
      setTimeout(() => {
        this.searchCache.delete(cacheKey);
      }, this.cacheTimeout);

      return sortedResults;

    } catch (error) {
      console.error('خطأ في البحث الشامل:', error);
      return [];
    }
  }

  // البحث في فواتير المبيعات
  private async searchInvoices(searchTerm: string): Promise<SearchResult[]> {
    const results: SearchResult[] = [];
    
    try {
      const invoicesSnapshot = await getDocs(collection(db, 'sales_invoices'));
      
      invoicesSnapshot.forEach((doc) => {
        const data = doc.data();
        const invoiceNumber = data.invoiceNumber || '';
        const customerName = data.customerName || data.customer || '';
        const date = data.date || '';
        const total = data.totals?.afterTax || data.totals?.total || 0;

        // البحث في رقم الفاتورة أو اسم العميل أو التاريخ
        if (
          invoiceNumber.toLowerCase().includes(searchTerm) ||
          customerName.toLowerCase().includes(searchTerm) ||
          date.includes(searchTerm)
        ) {
          results.push({
            id: doc.id,
            type: 'invoice',
            title: `فاتورة ${invoiceNumber}`,
            subtitle: customerName,
            description: `التاريخ: ${date} - المبلغ: ${total} ريال`,
            route: `/sales/edit/${invoiceNumber}`,
            icon: '📋',
            data: data,
            relevanceScore: this.calculateRelevance(searchTerm, [invoiceNumber, customerName, date])
          });
        }
      });
    } catch (error) {
      console.error('خطأ في البحث في الفواتير:', error);
    }

    return results;
  }

  // البحث في العملاء
  private async searchCustomers(searchTerm: string): Promise<SearchResult[]> {
    const results: SearchResult[] = [];
    
    try {
      const customersSnapshot = await getDocs(collection(db, 'customers'));
      
      customersSnapshot.forEach((doc) => {
        const data = doc.data();
        const nameAr = data.nameAr || data.name || '';
        const nameEn = data.nameEn || '';
        const phone = data.customerPhone || data.phone || data.mobile || '';
        const email = data.email || '';
        const commercialRecord = data.commercialRecord || '';

        if (
          nameAr.toLowerCase().includes(searchTerm) ||
          nameEn.toLowerCase().includes(searchTerm) ||
          phone.includes(searchTerm) ||
          email.toLowerCase().includes(searchTerm) ||
          commercialRecord.includes(searchTerm)
        ) {
          results.push({
            id: doc.id,
            type: 'customer',
            title: nameAr,
            subtitle: nameEn,
            description: `الهاتف: ${phone}${email ? ` - البريد: ${email}` : ''}`,
            route: '/customers',
            icon: '👤',
            data: data,
            relevanceScore: this.calculateRelevance(searchTerm, [nameAr, nameEn, phone, email])
          });
        }
      });
    } catch (error) {
      console.error('خطأ في البحث في العملاء:', error);
    }

    return results;
  }

  // البحث في الموردين
  private async searchSuppliers(searchTerm: string): Promise<SearchResult[]> {
    const results: SearchResult[] = [];
    
    try {
      const suppliersSnapshot = await getDocs(collection(db, 'suppliers'));
      
      suppliersSnapshot.forEach((doc) => {
        const data = doc.data();
        const name = data.name || '';
        const phone = data.phone || '';
        const email = data.email || '';
        const companyNumber = data.companyNumber || '';

        if (
          name.toLowerCase().includes(searchTerm) ||
          phone.includes(searchTerm) ||
          email.toLowerCase().includes(searchTerm) ||
          companyNumber.includes(searchTerm)
        ) {
          results.push({
            id: doc.id,
            type: 'supplier',
            title: name,
            subtitle: companyNumber,
            description: `الهاتف: ${phone}${email ? ` - البريد: ${email}` : ''}`,
            route: '/suppliers',
            icon: '🏢',
            data: data,
            relevanceScore: this.calculateRelevance(searchTerm, [name, phone, email, companyNumber])
          });
        }
      });
    } catch (error) {
      console.error('خطأ في البحث في الموردين:', error);
    }

    return results;
  }

  // البحث في الأصناف
  private async searchItems(searchTerm: string): Promise<SearchResult[]> {
    const results: SearchResult[] = [];
    
    try {
      const itemsSnapshot = await getDocs(collection(db, 'inventory_items'));
      
      itemsSnapshot.forEach((doc) => {
        const data = doc.data();
        const name = data.name || '';
        const itemCode = data.itemCode || '';
        const barcode = data.barcode || '';
        const salePrice = data.salePrice || 0;

        if (
          name.toLowerCase().includes(searchTerm) ||
          itemCode.toLowerCase().includes(searchTerm) ||
          barcode.includes(searchTerm)
        ) {
          results.push({
            id: doc.id,
            type: 'item',
            title: name,
            subtitle: itemCode,
            description: `الباركود: ${barcode} - السعر: ${salePrice} ريال`,
            route: '/items',
            icon: '📦',
            data: data,
            relevanceScore: this.calculateRelevance(searchTerm, [name, itemCode, barcode])
          });
        }
      });
    } catch (error) {
      console.error('خطأ في البحث في الأصناف:', error);
    }

    return results;
  }

  // البحث في الحسابات
  private async searchAccounts(searchTerm: string): Promise<SearchResult[]> {
    const results: SearchResult[] = [];
    
    try {
      const accountsSnapshot = await getDocs(collection(db, 'accounts'));
      
      accountsSnapshot.forEach((doc) => {
        const data = doc.data();
        const nameAr = data.nameAr || '';
        const nameEn = data.nameEn || '';
        const code = data.code || '';
        const nature = data.nature || '';

        if (
          nameAr.toLowerCase().includes(searchTerm) ||
          nameEn.toLowerCase().includes(searchTerm) ||
          code.includes(searchTerm)
        ) {
          results.push({
            id: doc.id,
            type: 'account',
            title: nameAr,
            subtitle: nameEn,
            description: `الكود: ${code} - الطبيعة: ${nature}`,
            route: '/accounting',
            icon: '💰',
            data: data,
            relevanceScore: this.calculateRelevance(searchTerm, [nameAr, nameEn, code])
          });
        }
      });
    } catch (error) {
      console.error('خطأ في البحث في الحسابات:', error);
    }

    return results;
  }

  // البحث في الفروع
  private async searchBranches(searchTerm: string): Promise<SearchResult[]> {
    const results: SearchResult[] = [];
    
    try {
      const branchesSnapshot = await getDocs(collection(db, 'branches'));
      
      branchesSnapshot.forEach((doc) => {
        const data = doc.data();
        const name = data.name || '';
        const code = data.code || '';
        const address = data.address || '';
        const manager = data.manager || '';

        if (
          name.toLowerCase().includes(searchTerm) ||
          code.toLowerCase().includes(searchTerm) ||
          address.toLowerCase().includes(searchTerm) ||
          manager.toLowerCase().includes(searchTerm)
        ) {
          results.push({
            id: doc.id,
            type: 'branch',
            title: name,
            subtitle: code,
            description: `العنوان: ${address} - المدير: ${manager}`,
            route: '/branches',
            icon: '🏪',
            data: data,
            relevanceScore: this.calculateRelevance(searchTerm, [name, code, address, manager])
          });
        }
      });
    } catch (error) {
      console.error('خطأ في البحث في الفروع:', error);
    }

    return results;
  }

  // البحث في المخازن
  private async searchWarehouses(searchTerm: string): Promise<SearchResult[]> {
    const results: SearchResult[] = [];
    
    try {
      const warehousesSnapshot = await getDocs(collection(db, 'warehouses'));
      
      warehousesSnapshot.forEach((doc) => {
        const data = doc.data();
        const name = data.name || '';
        const location = data.location || '';

        if (
          name.toLowerCase().includes(searchTerm) ||
          location.toLowerCase().includes(searchTerm)
        ) {
          results.push({
            id: doc.id,
            type: 'warehouse',
            title: name,
            subtitle: location,
            description: `المخزن: ${name}`,
            route: '/warehouses',
            icon: '🏭',
            data: data,
            relevanceScore: this.calculateRelevance(searchTerm, [name, location])
          });
        }
      });
    } catch (error) {
      console.error('خطأ في البحث في المخازن:', error);
    }

    return results;
  }

  // البحث في مرتجعات المبيعات
  private async searchReturns(searchTerm: string): Promise<SearchResult[]> {
    const results: SearchResult[] = [];
    
    try {
      const returnsSnapshot = await getDocs(collection(db, 'sales_returns'));
      
      returnsSnapshot.forEach((doc) => {
        const data = doc.data();
        const invoiceNumber = data.invoiceNumber || '';
        const referenceNumber = data.referenceNumber || '';
        const customerName = data.customerName || '';
        const date = data.date || '';

        if (
          invoiceNumber.toLowerCase().includes(searchTerm) ||
          referenceNumber.toLowerCase().includes(searchTerm) ||
          customerName.toLowerCase().includes(searchTerm)
        ) {
          results.push({
            id: doc.id,
            type: 'return',
            title: `مرتجع ${referenceNumber || invoiceNumber}`,
            subtitle: customerName,
            description: `التاريخ: ${date} - الفاتورة الأصلية: ${invoiceNumber}`,
            route: `/sales-return/edit/${referenceNumber || invoiceNumber}`,
            icon: '↩️',
            data: data,
            relevanceScore: this.calculateRelevance(searchTerm, [invoiceNumber, referenceNumber, customerName])
          });
        }
      });
    } catch (error) {
      console.error('خطأ في البحث في المرتجعات:', error);
    }

    return results;
  }

  // البحث في فواتير المشتريات
  private async searchPurchases(searchTerm: string): Promise<SearchResult[]> {
    const results: SearchResult[] = [];
    
    try {
      const purchasesSnapshot = await getDocs(collection(db, 'purchases_invoices'));
      
      purchasesSnapshot.forEach((doc) => {
        const data = doc.data();
        const invoiceNumber = data.invoiceNumber || '';
        const supplierName = data.supplierName || data.supplier || '';
        const date = data.date || '';
        const total = data.totals?.afterTax || data.totals?.total || 0;

        if (
          invoiceNumber.toLowerCase().includes(searchTerm) ||
          supplierName.toLowerCase().includes(searchTerm) ||
          date.includes(searchTerm)
        ) {
          results.push({
            id: doc.id,
            type: 'purchase',
            title: `فاتورة مشتريات ${invoiceNumber}`,
            subtitle: supplierName,
            description: `التاريخ: ${date} - المبلغ: ${total} ريال`,
            route: `/purchases/edit/${invoiceNumber}`,
            icon: '🛒',
            data: data,
            relevanceScore: this.calculateRelevance(searchTerm, [invoiceNumber, supplierName, date])
          });
        }
      });
    } catch (error) {
      console.error('خطأ في البحث في فواتير المشتريات:', error);
    }

    return results;
  }

  // البحث في المندوبين
  private async searchDelegates(searchTerm: string): Promise<SearchResult[]> {
    const results: SearchResult[] = [];
    
    try {
      const delegatesSnapshot = await getDocs(collection(db, 'delegates'));
      
      delegatesSnapshot.forEach((doc) => {
        const data = doc.data();
        const name = data.name || '';
        const phone = data.phone || '';
        const email = data.email || '';

        if (
          name.toLowerCase().includes(searchTerm) ||
          phone.includes(searchTerm) ||
          email.toLowerCase().includes(searchTerm)
        ) {
          results.push({
            id: doc.id,
            type: 'delegate',
            title: name,
            subtitle: phone,
            description: `المندوب: ${name}${email ? ` - البريد: ${email}` : ''}`,
            route: '/delegates',
            icon: '👨‍💼',
            data: data,
            relevanceScore: this.calculateRelevance(searchTerm, [name, phone, email])
          });
        }
      });
    } catch (error) {
      console.error('خطأ في البحث في المندوبين:', error);
    }

    return results;
  }

  // البحث في الصناديق
  private async searchCashBoxes(searchTerm: string): Promise<SearchResult[]> {
    const results: SearchResult[] = [];
    
    try {
      const cashboxesSnapshot = await getDocs(collection(db, 'cashBoxes'));
      
      cashboxesSnapshot.forEach((doc) => {
        const data = doc.data();
        const nameAr = data.nameAr || '';
        const nameEn = data.nameEn || '';
        const branch = data.branch || '';

        if (
          nameAr.toLowerCase().includes(searchTerm) ||
          nameEn.toLowerCase().includes(searchTerm) ||
          branch.toLowerCase().includes(searchTerm)
        ) {
          results.push({
            id: doc.id,
            type: 'cashbox',
            title: nameAr,
            subtitle: nameEn,
            description: `الفرع: ${branch}`,
            route: '/cashboxes',
            icon: '💳',
            data: data,
            relevanceScore: this.calculateRelevance(searchTerm, [nameAr, nameEn, branch])
          });
        }
      });
    } catch (error) {
      console.error('خطأ في البحث في الصناديق:', error);
    }

    return results;
  }

  // حساب درجة الصلة للنتيجة
  private calculateRelevance(searchTerm: string, fields: string[]): number {
    let score = 0;
    const lowerSearchTerm = searchTerm.toLowerCase();
    
    fields.forEach(field => {
      const lowerField = field.toLowerCase();
      
      // مطابقة تامة
      if (lowerField === lowerSearchTerm) {
        score += 100;
      }
      // يبدأ بالكلمة المبحوث عنها
      else if (lowerField.startsWith(lowerSearchTerm)) {
        score += 80;
      }
      // يحتوي على الكلمة المبحوث عنها
      else if (lowerField.includes(lowerSearchTerm)) {
        score += 50;
      }
      // مطابقة جزئية للكلمات
      else {
        const searchWords = lowerSearchTerm.split(' ');
        const fieldWords = lowerField.split(' ');
        
        searchWords.forEach(searchWord => {
          fieldWords.forEach(fieldWord => {
            if (fieldWord.includes(searchWord)) {
              score += 20;
            }
          });
        });
      }
    });

    return score;
  }

  // ترتيب النتائج حسب الصلة
  private sortByRelevance(results: SearchResult[], searchTerm: string): SearchResult[] {
    return results.sort((a, b) => {
      // ترتيب حسب درجة الصلة أولاً
      const scoreDiff = (b.relevanceScore || 0) - (a.relevanceScore || 0);
      if (scoreDiff !== 0) return scoreDiff;
      
      // ثم حسب النوع (الفواتير أولاً، ثم العملاء، إلخ)
      const typeOrder = ['invoice', 'customer', 'supplier', 'item', 'account', 'branch', 'warehouse', 'return', 'purchase', 'delegate', 'cashbox'];
      const typeAIndex = typeOrder.indexOf(a.type);
      const typeBIndex = typeOrder.indexOf(b.type);
      
      if (typeAIndex !== typeBIndex) {
        return typeAIndex - typeBIndex;
      }
      
      // أخيراً حسب العنوان أبجدياً
      return a.title.localeCompare(b.title, 'ar');
    });
  }

  // جلب العناصر الحديثة كاقتراحات
  private async getRecentItems(): Promise<SearchResult[]> {
    const results: SearchResult[] = [];
    
    try {
      // آخر الفواتير
      const recentInvoicesQuery = query(
        collection(db, 'sales_invoices'),
        orderBy('createdAt', 'desc'),
        limit(5)
      );
      const recentInvoices = await getDocs(recentInvoicesQuery);
      
      recentInvoices.forEach((doc) => {
        const data = doc.data();
        results.push({
          id: doc.id,
          type: 'invoice',
          title: `فاتورة ${data.invoiceNumber || ''}`,
          subtitle: data.customerName || '',
          description: `حديثة`,
          route: `/sales/edit/${data.invoiceNumber}`,
          icon: '📋',
          data: data
        });
      });

      // آخر العملاء
      const recentCustomersQuery = query(
        collection(db, 'customers'),
        orderBy('createdAt', 'desc'),
        limit(3)
      );
      const recentCustomers = await getDocs(recentCustomersQuery);
      
      recentCustomers.forEach((doc) => {
        const data = doc.data();
        results.push({
          id: doc.id,
          type: 'customer',
          title: data.nameAr || data.name || '',
          subtitle: data.customerPhone || '',
          description: `عميل جديد`,
          route: '/customers',
          icon: '👤',
          data: data
        });
      });

    } catch (error) {
      console.error('خطأ في جلب العناصر الحديثة:', error);
    }

    return results;
  }

  // مسح الكاش
  clearCache(): void {
    this.searchCache.clear();
  }

  // البحث السريع (للاقتراحات أثناء الكتابة)
  async quickSearch(query: string, limit: number = 10): Promise<SearchResult[]> {
    if (!query || query.trim().length < 2) {
      return [];
    }

    return this.universalSearch({
      query: query.trim(),
      limit,
      includeRecentItems: false
    });
  }

  // البحث بالباركود
  async searchByBarcode(barcode: string): Promise<SearchResult[]> {
    const results: SearchResult[] = [];
    
    try {
      const itemsSnapshot = await getDocs(collection(db, 'inventory_items'));
      
      itemsSnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.barcode === barcode) {
          results.push({
            id: doc.id,
            type: 'item',
            title: data.name || '',
            subtitle: data.itemCode || '',
            description: `الباركود: ${barcode}`,
            route: '/items',
            icon: '📦',
            data: data,
            relevanceScore: 100
          });
        }
      });
    } catch (error) {
      console.error('خطأ في البحث بالباركود:', error);
    }

    return results;
  }
}

export const searchService = SearchService.getInstance();
export default searchService;
