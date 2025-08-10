import { useState, useCallback, useMemo } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Types
interface InvoiceItem {
  itemNumber: string;
  itemName: string;
  quantity: string;
  unit: string;
  price: string;
  discountPercent: string;
  discountValue: number;
  taxPercent: string;
  taxValue: number;
  total: number;
  isNewItem?: boolean;
  warehouseId?: string;
}

interface MultiplePayment {
  cash?: {
    amount: string;
    cashBoxId: string;
  };
  bank?: {
    amount: string;
    bankId: string;
    accountNumber: string;
  };
  card?: {
    amount: string;
  };
}

interface InvoiceData {
  invoiceNumber: string;
  entryNumber: string;
  date: string;
  paymentMethod: string;
  cashBox: string;
  multiplePayment: MultiplePayment;
  branch: string;
  warehouse: string;
  customerNumber: string;
  customerName: string;
  delegate: string;
  priceRule: string;
  commercialRecord: string;
  taxFile: string;
  dueDate?: string;
}

interface Totals {
  afterDiscount: number;
  afterTax: number;
  total: number;
  tax: number;
}

const initialItem: InvoiceItem = {
  itemNumber: '',
  itemName: '',
  quantity: '1',
  unit: 'قطعة',
  price: '',
  discountPercent: '0',
  discountValue: 0,
  taxPercent: '15',
  taxValue: 0,
  total: 0,
  isNewItem: false
};

// Custom hook for invoice management
export const useInvoiceManagement = (taxRate: string = '15') => {
  // Invoice states
  const [invoiceType, setInvoiceType] = useState<'ضريبة مبسطة' | 'ضريبة'>('ضريبة مبسطة');
  const [warehouseMode, setWarehouseMode] = useState<'single' | 'multiple'>('single');
  const [multiplePaymentMode, setMultiplePaymentMode] = useState<boolean>(false);
  const [priceType, setPriceType] = useState<'سعر البيع' | 'آخر سعر العميل'>('سعر البيع');

  // Invoice data
  const [invoiceData, setInvoiceData] = useState<InvoiceData>({
    invoiceNumber: '',
    entryNumber: '',
    date: '',
    paymentMethod: '',
    cashBox: '',
    multiplePayment: {},
    branch: '',
    warehouse: '',
    customerNumber: '',
    customerName: '',
    delegate: '',
    priceRule: '',
    commercialRecord: '',
    taxFile: '',
    dueDate: ''
  });

  // Items and totals
  const [item, setItem] = useState<InvoiceItem & { warehouseId?: string }>({
    ...initialItem,
    taxPercent: taxRate
  });
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);

  // Stock management
  const [itemStocks, setItemStocks] = useState<{[key: string]: number}>({});

  // Calculate totals
  const totals = useMemo(() => {
    const itemsTotal = items.reduce((sum, item) => {
      const qty = parseFloat(item.quantity) || 0;
      const price = parseFloat(item.price) || 0;
      const discountPercent = parseFloat(item.discountPercent) || 0;
      
      const subtotal = qty * price;
      const discountAmount = subtotal * (discountPercent / 100);
      const afterDiscount = subtotal - discountAmount;
      
      return sum + afterDiscount;
    }, 0);

    const taxAmount = items.reduce((sum, item) => {
      const qty = parseFloat(item.quantity) || 0;
      const price = parseFloat(item.price) || 0;
      const discountPercent = parseFloat(item.discountPercent) || 0;
      const taxPercent = parseFloat(item.taxPercent) || 0;
      
      const subtotal = qty * price;
      const discountAmount = subtotal * (discountPercent / 100);
      const afterDiscount = subtotal - discountAmount;
      const tax = afterDiscount * (taxPercent / 100);
      
      return sum + tax;
    }, 0);

    return {
      total: itemsTotal,
      afterDiscount: itemsTotal,
      tax: taxAmount,
      afterTax: itemsTotal + taxAmount
    };
  }, [items]);

  // Check stock availability
  const checkStockAvailability = useCallback(async (itemName: string, warehouseId: string): Promise<number> => {
    try {
      // Get purchases (incoming stock)
      const purchasesSnap = await getDocs(collection(db, "purchases_invoices"));
      const allPurchases = purchasesSnap.docs.map(doc => doc.data());
      
      // Get sales (outgoing stock)
      const salesSnap = await getDocs(collection(db, "sales_invoices"));
      const allSales = salesSnap.docs.map(doc => doc.data());
      
      // Calculate stock for specific item and warehouse
      let totalIncoming = 0;
      let totalOutgoing = 0;
      
      // Calculate incoming from purchases
      allPurchases.forEach(purchase => {
        if (purchase.warehouse === warehouseId && purchase.items) {
          purchase.items.forEach((purchaseItem: { itemName: string; quantity: string | number }) => {
            if (purchaseItem.itemName === itemName) {
              totalIncoming += parseFloat(String(purchaseItem.quantity)) || 0;
            }
          });
        }
      });
      
      // Calculate outgoing from sales
      allSales.forEach(sale => {
        if (sale.warehouse === warehouseId && sale.items) {
          sale.items.forEach((saleItem: { itemName: string; quantity: string | number }) => {
            if (saleItem.itemName === itemName) {
              totalOutgoing += parseFloat(String(saleItem.quantity)) || 0;
            }
          });
        }
      });
      
      return totalIncoming - totalOutgoing;
    } catch (error) {
      console.error('خطأ في فحص المخزون:', error);
      return 0;
    }
  }, []);

  // Fetch stock for single item
  const fetchSingleItemStock = useCallback(async (itemName: string, warehouseId: string): Promise<number> => {
    if (!itemName || !warehouseId) return 0;
    
    try {
      const stock = await checkStockAvailability(itemName, warehouseId);
      setItemStocks(prev => ({
        ...prev,
        [`${itemName}-${warehouseId}`]: stock
      }));
      return stock;
    } catch (error) {
      console.error('خطأ في جلب رصيد الصنف:', error);
      return 0;
    }
  }, [checkStockAvailability]);

  // Add item to invoice
  const addItem = useCallback(() => {
    if (!item.itemName || !item.quantity || !item.price) {
      return false;
    }

    const newItem: InvoiceItem = {
      ...item,
      discountValue: (parseFloat(item.quantity) * parseFloat(item.price)) * (parseFloat(item.discountPercent) / 100),
      taxValue: (parseFloat(item.quantity) * parseFloat(item.price)) * (parseFloat(item.taxPercent) / 100),
      total: parseFloat(item.quantity) * parseFloat(item.price)
    };

    if (editingItemIndex !== null) {
      // Update existing item
      setItems(prev => prev.map((existing, index) => 
        index === editingItemIndex ? newItem : existing
      ));
      setEditingItemIndex(null);
    } else {
      // Add new item
      setItems(prev => [...prev, newItem]);
    }

    // Reset item form
    setItem({
      ...initialItem,
      taxPercent: taxRate,
      quantity: '1'
    });

    return true;
  }, [item, editingItemIndex, taxRate]);

  // Edit item
  const editItem = useCallback((index: number) => {
    const itemToEdit = items[index];
    setItem(itemToEdit);
    setEditingItemIndex(index);
  }, [items]);

  // Delete item
  const deleteItem = useCallback((index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index));
    if (editingItemIndex === index) {
      setEditingItemIndex(null);
      setItem({
        ...initialItem,
        taxPercent: taxRate,
        quantity: '1'
      });
    }
  }, [editingItemIndex, taxRate]);

  // Cancel editing
  const cancelEdit = useCallback(() => {
    setEditingItemIndex(null);
    setItem({
      ...initialItem,
      taxPercent: taxRate,
      quantity: '1'
    });
  }, [taxRate]);

  // Reset invoice
  const resetInvoice = useCallback(() => {
    setInvoiceData({
      invoiceNumber: '',
      entryNumber: '',
      date: '',
      paymentMethod: '',
      cashBox: '',
      multiplePayment: {},
      branch: '',
      warehouse: '',
      customerNumber: '',
      customerName: '',
      delegate: '',
      priceRule: '',
      commercialRecord: '',
      taxFile: '',
      dueDate: ''
    });
    setItems([]);
    setItem({
      ...initialItem,
      taxPercent: taxRate,
      quantity: '1'
    });
    setEditingItemIndex(null);
    setItemStocks({});
  }, [taxRate]);

  // Validation
  const isReadyToSave = useMemo(() => {
    return (
      invoiceData.branch &&
      invoiceData.customerName &&
      (warehouseMode === 'multiple' || invoiceData.warehouse) &&
      items.length > 0 &&
      invoiceData.paymentMethod &&
      (!multiplePaymentMode || Math.abs(
        (parseFloat(invoiceData.multiplePayment.cash?.amount || '0') +
         parseFloat(invoiceData.multiplePayment.bank?.amount || '0') +
         parseFloat(invoiceData.multiplePayment.card?.amount || '0')) - totals.afterTax
      ) <= 0.01)
    );
  }, [invoiceData, warehouseMode, items.length, multiplePaymentMode, totals.afterTax]);

  return {
    // States
    invoiceType,
    setInvoiceType,
    warehouseMode,
    setWarehouseMode,
    multiplePaymentMode,
    setMultiplePaymentMode,
    priceType,
    setPriceType,
    invoiceData,
    setInvoiceData,
    item,
    setItem,
    items,
    editingItemIndex,
    itemStocks,
    setItemStocks,
    
    // Computed values
    totals,
    isReadyToSave,
    
    // Functions
    addItem,
    editItem,
    deleteItem,
    cancelEdit,
    resetInvoice,
    checkStockAvailability,
    fetchSingleItemStock
  };
};
