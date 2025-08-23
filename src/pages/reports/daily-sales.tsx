import "./hide-datepicker-weekdays.css";
import React from "react";
import { Helmet } from "react-helmet";
import Breadcrumb from "../../components/Breadcrumb";
import { Form, DatePicker, TimePicker, Select, Button, Input } from "antd";
import arEG from 'antd/es/date-picker/locale/ar_EG';
import './hide-datepicker-weekdays.css';

// تخصيص locale لإخفاء أسماء الأيام
const customArEg = {
  ...arEG,
  weekDays: ["", "", "", "", "", "", ""]
};
import { PrinterOutlined, CreditCardOutlined } from "@ant-design/icons";
import { motion } from "framer-motion";
import { useEffect, useState, useCallback } from "react";

import { fetchBranches, Branch } from "@/lib/branches";
import dayjs, { Dayjs } from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

const { RangePicker } = DatePicker;

const gridLabels = [
  [
    "مبيعات النقدي",
    "مبيعات الشبكة", 
    "مبيعات الآجلة",
    "مبيعات التحويلات",
  ],
  [
    "مرتجعات نقدي",
    "مرتجعات شبكة",
    "مرتجعات آجلة", 
    "مرتجعات تحويلات",
  ],
  [
    "صافي مبيعات نقدي",
    "صافي مبيعات شبكة",
    "صافي مبيعات آجلة",
    "صافي مبيعات التحويلات",
  ],
];

import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
// استيراد مكونات الرسم البياني للفروع
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

// جلب طرق الدفع من قاعدة البيانات
const usePaymentMethods = () => {
  const [paymentMethods, setPaymentMethods] = useState<string[]>(['نقدي', 'شبكة', 'آجل']);
  useEffect(() => {
    (async () => {
      try {
        const { getDocs, collection } = await import('firebase/firestore');
        const { db } = await import('@/lib/firebase');
        const snap = await getDocs(collection(db, 'paymentMethods'));
        const methods = snap.docs.map(doc => doc.data().name).filter(Boolean);
        if (methods.length) setPaymentMethods(methods);
      } catch {}
    })();
  }, []);
  return paymentMethods;
};

const DailySales: React.FC = () => {
  // قائمة المندوبين لجلب الأسماء الصحيحة
  const [salesReps, setSalesReps] = useState<any[]>([]);
  // جلب قائمة المندوبين من قاعدة البيانات مرة واحدة فقط
  useEffect(() => {
    (async () => {
      try {
        const { getDocs, collection } = await import('firebase/firestore');
        const { db } = await import('@/lib/firebase');
        const repsSnap = await getDocs(collection(db, 'salesRepresentatives'));
        setSalesReps(repsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch {}
    })();
  }, []);
  // بيانات رسم بياني مبيعات المناديب
  const [repChartData, setRepChartData] = useState<Array<{
    repName: string;
    totalSales: number;
    invoiceCount: number;
  }>>([]);
  // بيانات رسم بياني مبيعات الأصناف
  const [itemChartData, setItemChartData] = useState<Array<{
    itemName: string;
    totalQty: number;
    totalSales: number;
  }>>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [branchesLoading, setBranchesLoading] = useState(true);
  const [salesInvoices, setSalesInvoices] = useState<Record<string, unknown>[]>([]);
  const [salesReturns, setSalesReturns] = useState<Record<string, unknown>[]>([]);
  const [branchSales, setBranchSales] = useState<Array<{
    branchId: string;
    branchName: string;
    totalSales: number;
    totalDiscount: number;
    totalTax: number;
    netTotal: number;
    invoiceCount: number;
  }>>([]);
  const [branchChartData, setBranchChartData] = useState<Array<{
    branchName: string;
    totalSales: number;
    netTotal: number;
  }>>([]);
  // بيانات الرسم البياني السنوي
  const [annualChartData, setAnnualChartData] = useState<Array<{
    month: string;
    totalSales: number;
    netTotal: number;
  }>>([]);

  useEffect(() => {
    // حساب مبيعات الفروع من الفواتير والمرتجعات
    const branchMap: {
      [key: string]: {
        branchId: string;
        branchName: string;
        totalSales: number;
        totalDiscount: number;
        totalTax: number;
        netTotal: number;
        invoiceCount: number;
      }
    } = {};
    salesInvoices.forEach(inv => {
      const invAny = inv as any;
      const branchId = invAny.branch || invAny.branchId || '';
      const branchName = branches.find(b => String(b.id) === String(branchId))?.name || branchId || '---';
      if (!branchMap[branchId]) {
        branchMap[branchId] = {
          branchId,
          branchName,
          totalSales: 0,
          totalDiscount: 0,
          totalTax: 0,
          netTotal: 0,
          invoiceCount: 0
        };
      }
      const totals = invAny.totals || {};
      branchMap[branchId].totalSales += (totals.beforeDiscount ?? totals.total ?? totals.afterTax ?? invAny.total ?? 0);
      // جمع الخصم من الأصناف إذا لم يوجد في totals.discount أو invAny.discount
      let discountValue = totals.discount ?? invAny.discount;
      if (discountValue == null) {
        if (Array.isArray(invAny.items)) {
          discountValue = invAny.items.reduce((acc: number, item: any) => acc + Number(item.discountValue || item.discount || 0), 0);
        } else {
          discountValue = 0;
        }
      }
      branchMap[branchId].totalDiscount += discountValue;
      branchMap[branchId].totalTax += (totals.tax ?? invAny.taxValue ?? 0);
      // الصافي = إجمالي المبيعات - إجمالي الخصم - إجمالي الضريبة
      branchMap[branchId].netTotal += ((totals.beforeDiscount ?? totals.total ?? totals.afterTax ?? invAny.total ?? 0) - discountValue - (totals.tax ?? invAny.taxValue ?? 0));
      branchMap[branchId].invoiceCount += 1;
    });
    // تم حذف معالجة المرتجعات
    const branchSalesArr = Object.values(branchMap);
    setBranchSales(branchSalesArr);
    setBranchChartData(
      branchSalesArr.map(b => ({ branchName: b.branchName, totalSales: b.totalSales, netTotal: b.netTotal }))
        .sort((a, b) => b.totalSales - a.totalSales)
    );

    // حساب مبيعات السنة حسب الأشهر
    const months = [
      "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
    ];
    // مصفوفة 12 شهر
    const monthlyTotals: Array<{ month: string; totalSales: number; totalDiscount: number; netTotal: number }> = months.map((m, i) => ({ month: m, totalSales: 0, totalDiscount: 0, netTotal: 0 }));
    // جمع الفواتير
    salesInvoices.forEach(inv => {
      const invAny = inv as any;
      const d = invAny.date ? dayjs(invAny.date) : null;
      if (d && d.isValid()) {
        const monthIdx = d.month(); // 0-11
        const totals = invAny.totals || {};
        monthlyTotals[monthIdx].totalSales += (totals.beforeDiscount ?? totals.total ?? totals.afterTax ?? invAny.total ?? 0);
        // جمع الخصم من الأصناف إذا لم يوجد في totals.discount أو invAny.discount
        let discountValue = totals.discount ?? invAny.discount;
        if (discountValue == null) {
          if (Array.isArray(invAny.items)) {
            discountValue = invAny.items.reduce((acc: number, item: any) => acc + Number(item.discountValue || item.discount || 0), 0);
          } else {
            discountValue = 0;
          }
        }
        monthlyTotals[monthIdx].totalDiscount += discountValue;
        // الصافي = إجمالي المبيعات - إجمالي الخصم - إجمالي الضريبة
        monthlyTotals[monthIdx].netTotal += ((totals.beforeDiscount ?? totals.total ?? totals.afterTax ?? invAny.total ?? 0) - discountValue - (totals.tax ?? invAny.taxValue ?? 0));
      }
    });
    // تم حذف خصم المرتجعات من تجميع الأشهر
    setAnnualChartData(monthlyTotals);
    // حساب مبيعات الأصناف الأكثر مبيعاً
    const itemMap: { [key: string]: { itemName: string; totalQty: number; totalSales: number } } = {};
    salesInvoices.forEach(inv => {
      if (Array.isArray(inv.items)) {
        inv.items.forEach((item: any) => {
          const name = item.name || item.itemName || item.title || '---';
          const qty = Number(item.qty || item.quantity || 0);
          const total = Number(item.total || item.priceTotal || item.amount || 0);
          if (!itemMap[name]) {
            itemMap[name] = { itemName: name, totalQty: 0, totalSales: 0 };
          }
          itemMap[name].totalQty += qty;
          itemMap[name].totalSales += total;
        });
      }
    });
    // تحويل إلى مصفوفة وترتيب حسب الكمية أو المبيعات
    const itemsArr = Object.values(itemMap)
      .sort((a, b) => b.totalQty - a.totalQty)
      .slice(0, 15); // عرض أعلى 15 صنف فقط
    setItemChartData(itemsArr);
    // حساب مبيعات المناديب
    const repMap: { [key: string]: { repName: string; totalSales: number; invoiceCount: number } } = {};
    salesInvoices.forEach(inv => {
      // استخراج معرف المندوب من جميع الحقول الممكنة
      let repId = inv.salesRep || inv.repName || inv.salesman || inv.salesRepName || '';
      let repName = '';
      // إذا كان repId كائن (بعض الأنظمة تحفظ المندوب ككائن)، خذ الاسم والمعرف
      if (typeof repId === 'object' && repId !== null) {
        const repObj = repId as Record<string, any>;
        repName = repObj.name || repObj.fullName || repObj.title || '';
        repId = repObj.id || repObj._id || repName;
      }
      // إذا لم يوجد اسم، ابحث في قائمة المندوبين
      if (!repName || String(repName).trim() === '' || String(repName).trim() === '---') {
        const foundRep = salesReps.find(r => String(r.id) === String(repId));
        repName = foundRep ? (foundRep.name || foundRep.fullName || foundRep.title || String(repId)) : String(repId);
      }
      // إذا بقي فارغاً، ضع 'غير محدد' مع إظهار معرف المندوب أو معرف الفاتورة
      if (!repName || String(repName).trim() === '' || String(repName).trim() === '---') {
        // إذا وجد معرف مندوب حقيقي
        if (repId && String(repId).trim() !== '') {
          repName = `غير محدد (${repId})`;
        } else if (inv.id) {
          repName = `غير محدد (فاتورة ${inv.id})`;
        } else {
          repName = 'غير محدد';
        }
      }
      const total = Number((inv.totals && (inv.totals as Record<string, any>).afterTax) || 0);
      if (!repMap[repName]) {
        repMap[repName] = { repName: repName, totalSales: 0, invoiceCount: 0 };
      }
      repMap[repName].totalSales += total;
      repMap[repName].invoiceCount += 1;
    });
    // ترتيب حسب إجمالي المبيعات
    const repsArr = Object.values(repMap)
      .sort((a, b) => b.totalSales - a.totalSales)
      .slice(0, 15); // عرض أعلى 15 مندوب فقط
    setRepChartData(repsArr);
  }, [salesInvoices, salesReturns, branches, salesReps]);
  // Removed duplicate useState declarations for branches, branchesLoading, salesInvoices, salesReturns
  // إضافة salesReps إلى التبعيات
  const [loading, setLoading] = useState<boolean>(false);
  const [dateFrom, setDateFrom] = useState<Dayjs | null>(null);
  const [dateTo, setDateTo] = useState<Dayjs | null>(null);
  const [timeFrom, setTimeFrom] = useState<Dayjs | null>(null);
  const [timeTo, setTimeTo] = useState<Dayjs | null>(null);
  const [branchId, setBranchId] = useState<string>('');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>('');
  const [companyData, setCompanyData] = useState<Record<string, unknown>>({});

  const paymentMethods = usePaymentMethods();
  
  useEffect(() => {
    fetchBranches().then(data => {
      setBranches(data);
      setBranchesLoading(false);
    });
    
    (async () => {
      try {
        const snap = await getDocs(collection(db, 'companies'));
        if (snap.docs.length > 0) {
          setCompanyData(snap.docs[0].data());
        }
      } catch (e) {
        setCompanyData({});
      }
    })();
  }, []);

  type Filters = {
    dateFrom?: Dayjs | string | Date | null;
    dateTo?: Dayjs | string | Date | null;
    branchId?: string;
    timeFrom?: Dayjs | null;
    timeTo?: Dayjs | null;
    paymentMethodFilter?: string;
  };

  const fetchData = useCallback(async (filters?: Filters) => {
    setLoading(true);
    try {
      const invoicesSnap = await getDocs(collection(db, 'sales_invoices'));
      let invoices = invoicesSnap.docs.map(doc => doc.data());
      // تم حذف جلب المرتجعات
      
      if (filters) {
        let fromDateTime = null;
        let toDateTime = null;
        if (filters.dateFrom) {
          fromDateTime = dayjs(filters.dateFrom);
          if (filters.timeFrom) {
            fromDateTime = fromDateTime.set('hour', filters.timeFrom.hour()).set('minute', filters.timeFrom.minute()).set('second', 0);
          } else {
            fromDateTime = fromDateTime.startOf('day');
          }
        }
        if (filters.dateTo) {
          toDateTime = dayjs(filters.dateTo);
          if (filters.timeTo) {
            toDateTime = toDateTime.set('hour', filters.timeTo.hour()).set('minute', filters.timeTo.minute()).set('second', 59);
          } else {
            toDateTime = toDateTime.endOf('day');
          }
        }
        
        const normalizeDate = (val: unknown) => {
          if (!val) return null;
          if (dayjs.isDayjs(val)) return val;
          if (typeof val === 'string' || val instanceof Date) return dayjs(val);
          if (val.seconds) return dayjs(val.seconds * 1000);
          return dayjs(val);
        };

        if (fromDateTime) {
          invoices = invoices.filter(inv => {
            const d = normalizeDate(inv.date);
            return d && d.isSameOrAfter(fromDateTime);
          });
          returns = returns.filter(ret => {
            const d = normalizeDate(ret.date);
            return d && d.isSameOrAfter(fromDateTime);
          });
        }
        if (toDateTime) {
          invoices = invoices.filter(inv => {
            const d = normalizeDate(inv.date);
            return d && d.isSameOrBefore(toDateTime);
          });
          returns = returns.filter(ret => {
            const d = normalizeDate(ret.date);
            return d && d.isSameOrBefore(toDateTime);
          });
        }
        if (filters.branchId && filters.branchId !== '') {
          const filterBranch = String(filters.branchId).trim();
          const branchObj = branches.find(b => String(b.id) === filterBranch);
          const branchName = branchObj ? String(branchObj.name).trim() : '';
          invoices = invoices.filter(inv => String(inv.branch || '').trim() === filterBranch);
          returns = returns.filter(ret => {
            const branchA = String(ret.branch || '').trim();
            const branchB = String(ret.branchId || '').trim();
            return branchA === filterBranch || branchB === filterBranch || branchA === branchName || branchB === branchName;
          });
        }
        if (filters.paymentMethodFilter && filters.paymentMethodFilter !== '') {
          const filterMethod = String(filters.paymentMethodFilter).trim();
          
          // فلترة الفواتير حسب طريقة الدفع
          invoices = invoices.filter(inv => {
            // إذا كانت طريقة الدفع متعددة، تحقق من وجود الطريقة المطلوبة في multiplePayment
            if (inv.paymentMethod === 'متعدد' && inv.multiplePayment) {
              const multiplePayment = inv.multiplePayment;
              
              // تحقق من النقدي
              if (filterMethod.includes('نقد') && multiplePayment.cash && parseFloat(multiplePayment.cash.amount || '0') > 0) {
                return true;
              }
              
              // تحقق من الشبكة
              if (filterMethod.includes('شبك') && multiplePayment.card && parseFloat(multiplePayment.card.amount || '0') > 0) {
                return true;
              }
              
              // تحقق من التحويل
              if (filterMethod.includes('تحويل') && multiplePayment.bank && parseFloat(multiplePayment.bank.amount || '0') > 0) {
                return true;
              }
              
              return false;
            } else {
              // طريقة دفع مفردة
              return String(inv.paymentMethod || '').trim() === filterMethod;
            }
          });
          
          // فلترة المرتجعات حسب طريقة الدفع
          returns = returns.filter(ret => {
            // إذا كانت طريقة الدفع متعددة، تحقق من وجود الطريقة المطلوبة في multiplePayment
            if (ret.paymentMethod === 'متعدد' && ret.multiplePayment) {
              const multiplePayment = ret.multiplePayment;
              
              // تحقق من النقدي
              if (filterMethod.includes('نقد') && multiplePayment.cash && parseFloat(multiplePayment.cash.amount || '0') > 0) {
                return true;
              }
              
              // تحقق من الشبكة
              if (filterMethod.includes('شبك') && multiplePayment.card && parseFloat(multiplePayment.card.amount || '0') > 0) {
                return true;
              }
              
              // تحقق من التحويل
              if (filterMethod.includes('تحويل') && multiplePayment.bank && parseFloat(multiplePayment.bank.amount || '0') > 0) {
                return true;
              }
              
              return false;
            } else {
              // طريقة دفع مفردة
              return String(ret.paymentMethod || '').trim() === filterMethod;
            }
          });
        }
      }
      setSalesInvoices(invoices);
      // تم حذف تعيين المرتجعات
    } catch (e) {
      setSalesInvoices([]);
      setSalesReturns([]);
    } finally {
      setLoading(false);
    }
  }, [branches]);

  useEffect(() => {
    const loadInitialData = async () => {
      await fetchData();
    };
    loadInitialData();
  }, [fetchData]);

  const gridValues = React.useMemo(() => {
    let cashCount = 0, networkCount = 0, creditCount = 0;
    let cashTotal = 0, networkTotal = 0, creditTotal = 0, transferTotal = 0;
    let netCash = 0, netNetwork = 0, netCredit = 0, netTransfer = 0;

    const findMethod = (keywords: string[]) =>
      paymentMethods.find(n => n && keywords.some(keyword => n.toString().replace(/\s/g, '').toLowerCase().includes(keyword))) || '';
    const cashName = findMethod(['نقد']);
    const networkName = findMethod(['شبك']);
    const creditName = findMethod(['آجل', 'اجل']);
    const transferName = findMethod(['تحويل', 'محول']);

    salesInvoices.forEach(inv => {
      if (!Array.isArray(inv.items)) return;
      const method = inv.paymentMethod;
      const invoiceTotal = inv.totals?.afterTax || 0;
      
      // التحقق من وجود الدفع المتعدد
      if (method === 'متعدد' && inv.multiplePayment) {
        const multiplePayment = inv.multiplePayment;
        let hasAnyPayment = false;
        
        // النقدي من الصناديق
        if (multiplePayment.cash && parseFloat(multiplePayment.cash.amount || '0') > 0) {
          cashTotal += parseFloat(multiplePayment.cash.amount || '0');
          hasAnyPayment = true;
        }
        
        // التحويلات البنكية
        if (multiplePayment.bank && parseFloat(multiplePayment.bank.amount || '0') > 0) {
          transferTotal += parseFloat(multiplePayment.bank.amount || '0');
          hasAnyPayment = true;
        }
        
        // الشبكة من البنوك
        if (multiplePayment.card && parseFloat(multiplePayment.card.amount || '0') > 0) {
          networkTotal += parseFloat(multiplePayment.card.amount || '0');
          hasAnyPayment = true;
        }
        
        // عد الفاتورة بناءً على نوع الدفع السائد
        if (hasAnyPayment) {
          const cashAmount = parseFloat(multiplePayment.cash?.amount || '0');
          const networkAmount = parseFloat(multiplePayment.card?.amount || '0');
          const transferAmount = parseFloat(multiplePayment.bank?.amount || '0');
          
          // تصنيف الفاتورة حسب المبلغ الأكبر
          if (cashAmount >= networkAmount && cashAmount >= transferAmount && cashAmount > 0) {
            cashCount++;
          } else if (networkAmount >= transferAmount && networkAmount > 0) {
            networkCount++;
          }
          // لا نعد التحويلات في عدد الفواتير لأنها تعتبر معاملات بنكية
        }
      } else {
        // طرق الدفع المفردة
        if (cashName && method && method.replace(/\s/g, '').toLowerCase().includes('نقد')) {
          cashCount++;
          cashTotal += invoiceTotal;
        } else if (networkName && method && method.replace(/\s/g, '').toLowerCase().includes('شبك')) {
          networkCount++;
          networkTotal += invoiceTotal;
        } else if (
          creditName &&
          method &&
          (method.replace(/\s/g, '').toLowerCase().includes('آجل') || method.replace(/\s/g, '').toLowerCase().includes('اجل'))
        ) {
          creditCount++;
          creditTotal += invoiceTotal; // إضافة المبلغ للمبيعات الآجلة
        } else if (transferName && method && method.replace(/\s/g, '').toLowerCase().includes('تحويل')) {
          transferTotal += invoiceTotal;
        }
      }
    });

    netCash = cashTotal;
    netNetwork = networkTotal;
    netCredit = creditTotal;
    netTransfer = transferTotal;

    return {
      counts: [cashCount, networkCount, creditCount],
      sales: [cashTotal, networkTotal, creditTotal, transferTotal],
      net: [netCash, netNetwork, netCredit, netTransfer]
    };
  }, [salesInvoices, salesReturns, paymentMethods]);

  const handlePrint = () => {
    const printWindow = window.open('', '', 'height=900,width=800');
    if (printWindow) {
      const printDate = new Date();
      const printDateStr = printDate.toLocaleString('ar-EG', { dateStyle: 'full', timeStyle: 'short' });
      const fontAwesomeCDN = '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">';
      
      printWindow.document.write(`
        <html>
          <head>
            <title>طباعة تقرير المبيعات اليومية</title>
            ${fontAwesomeCDN}
            <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;700&display=swap" rel="stylesheet">
            <style>
              @media print {
                @page { 
                  size: A4; 
                  margin: 10mm;
                  @top-center {
                    content: "تقرير المبيعات اليومية";
                    font-family: 'Cairo', 'Tajawal', sans-serif;
                    font-size: 14px;
                    color: #555;
                  }
                }
                body {
                  font-family: 'Cairo', 'Tajawal', Arial, sans-serif;
                  direction: rtl;
                  padding: 10mm;
                  color: #333;
                  font-size: 12px;
                  line-height: 1.6;
                }
                .header {
                  display: flex;
                  justify-content: space-between;
                  align-items: flex-start;
                  margin-bottom: 8mm;
                  border-bottom: 2px solid #2563eb;
                  padding-bottom: 5mm;
                }
                .header-section {
                  flex: 1;
                  min-width: 0;
                  padding: 0 10px;
                  box-sizing: border-box;
                }
                .header-section.center {
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  justify-content: center;
                  flex: 0 0 150px;
                  max-width: 120px;
                }
                .logo {
                  width: 120px;
                  height: auto;
                  margin-bottom: 10px;
                }
                .company-info-ar {
                  text-align: right;
                  font-size: 13px;
                  font-weight: 500;
                  line-height: 1.8;
                }
                .company-info-en {
                  text-align: left;
                  direction: ltr;
                  font-size: 12px;
                  font-weight: 500;
                  line-height: 1.8;
                }
                .info-icon {
                  margin-left: 5px;
                  color: #2563eb;
                  font-size: 11px;
                }
                .report-title {
                  text-align: center;
                  margin: 15px 0;
                  font-size: 20px;
                  font-weight: bold;
                  padding: 10px;
                  border-bottom: 2px solid #ddd;
                  border-top: 2px solid #ddd;
                }
                table {
                  width: 100%;
                  border-collapse: collapse;
                  margin: 15px 0 25px 0;
                }
                th {
                  background: #2563eb;
                  color: white;
                  padding: 10px;
                  text-align: center;
                  font-weight: bold;
                  border: 1px solid #ddd;
                }
                td {
                  border: 1px solid #ddd;
                  padding: 10px;
                  text-align: center;
                }
                tr:nth-child(even) {
                  background-color: #f9f9f9;
                }
                .value-cell {
                  font-weight: bold;
                  color: #2c3e50;
                }
                .label-cell {
                  color: #7f8c8d;
                  font-size: 11px;
                }
                .total-row {
                  background-color: #e3f2fd !important;
                  font-weight: bold;
                }
                .print-footer {
                  margin-top: 30px;
                  padding-top: 15px;
                  border-top: 1px solid #eee;
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                }
                .print-date {
                  text-align: left;
                  font-size: 12px;
                  color: #555;
                  direction: ltr;
                  display: flex;
                  align-items: center;
                }
                .signature {
                  text-align: center;
                  margin-top: 30px;
                }
                .signature-line {
                  width: 200px;
                  border-top: 1px solid #333;
                  margin: 5px auto;
                }
                .watermark {
                  position: fixed;
                  bottom: 10%;
                  right: 10%;
                  opacity: 0.1;
                  font-size: 80px;
                  color: #2563eb;
                  transform: rotate(-30deg);
                  pointer-events: none;
                  z-index: -1;
                }
                @media (max-width: 768px) {
                  .header {
                    flex-direction: column;
                  }
                  .header-section {
                    width: 100%;
                    margin-bottom: 1rem;
                  }
                  table {
                    font-size: 10px;
                  }
                  .report-title {
                    font-size: 16px;
                  }
                }
            </style>
          </head>
          <body>
            <div class="watermark">${companyData.arabicName || 'شركة'}</div>
            
            <div class="header">
              <div class="header-section company-info-ar">
                <div><i class="fas fa-building info-icon"></i> ${companyData.arabicName || ''}</div>
                <div><i class="fas fa-briefcase info-icon"></i> ${companyData.companyType || ''}</div>
                <div><i class="fas fa-file-alt info-icon"></i> السجل التجاري: ${companyData.commercialRegistration || ''}</div>
                <div><i class="fas fa-file-invoice-dollar info-icon"></i> الملف الضريبي: ${companyData.taxFile || ''}</div>
                <div><i class="fas fa-map-marker-alt info-icon"></i> العنوان: ${companyData.city || ''} ${companyData.region || ''} ${companyData.street || ''} ${companyData.district || ''} ${companyData.buildingNumber || ''}</div>
                <div><i class="fas fa-mail-bulk info-icon"></i> الرمز البريدي: ${companyData.postalCode || ''}</div>
                <div><i class="fas fa-phone-alt info-icon"></i> الهاتف: ${companyData.phone || ''}</div>
                <div><i class="fas fa-mobile-alt info-icon"></i> الجوال: ${companyData.mobile || ''}</div>
              </div>
              
              <div class="header-section center">
                <div class="logo-container">
                  <img src="${companyData.logoUrl || 'https://via.placeholder.com/120x60?text=Company+Logo'}" class="logo" alt="Company Logo">
                </div>
                <div style="text-align: center; font-weight: bold; margin-top: 5px;">
                  تقرير المبيعات
                </div>
              </div>
              
              <div class="header-section company-info-en">
                <div><i class="fas fa-building info-icon"></i> ${companyData.englishName || ''}</div>
                <div><i class="fas fa-briefcase info-icon"></i> ${companyData.companyType || ''}</div>
                <div><i class="fas fa-file-alt info-icon"></i> Commercial Reg.: ${companyData.commercialRegistration || ''}</div>
                <div><i class="fas fa-file-invoice-dollar info-icon"></i> Tax File: ${companyData.taxFile || ''}</div>
                <div><i class="fas fa-map-marker-alt info-icon"></i> Address: ${companyData.city || ''} ${companyData.region || ''} ${companyData.street || ''} ${companyData.district || ''} ${companyData.buildingNumber || ''}</div>
                <div><i class="fas fa-mail-bulk info-icon"></i> Postal Code: ${companyData.postalCode || ''}</div>
                <div><i class="fas fa-phone-alt info-icon"></i> Phone: ${companyData.phone || ''}</div>
                <div><i class="fas fa-mobile-alt info-icon"></i> Mobile: ${companyData.mobile || ''}</div>
              </div>
            </div>
            
            <div class="report-title">
              <i class="fas fa-file-invoice"></i> تقرير المبيعات اليومية
            </div>
            
            <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
              <div style="text-align: right;">
                <div><i class="fas fa-calendar-day"></i> تاريخ التقرير: ${new Date().toLocaleDateString('ar-EG')}</div>
                <div><i class="fas fa-user-tie"></i> مسؤول التقرير: ${'مدير المبيعات'}</div>
              </div>
              <div style="text-align: left; direction: ltr;">
                <div><i class="fas fa-hashtag"></i> كود التقرير: ${'RPT-' + Math.floor(1000 + Math.random() * 9000)}</div>
                <div><i class="fas fa-store"></i> الفرع: ${branchId || '---'}</div>
              </div>
            </div>
            
            <table>
              <thead>
                <tr>
                  ${gridLabels[0].map((_, colIdx) => `
                    <th>${String.fromCharCode(1632 + colIdx + 1)}</th>
                  `).join('')}
                </tr>
              </thead>
              <tbody>
                ${gridLabels.map((row, rowIdx) => `
                  <tr ${rowIdx === gridLabels.length - 1 ? 'class="total-row"' : ''}>
                    ${row.map((label, colIdx) => `
                      <td>
                        <div class="value-cell">\${(() => {
                          const valueKey = ${rowIdx} === 0 ? 'sales' : ${rowIdx} === 1 ? 'returns' : 'net';
                          const value = gridValues[valueKey][${colIdx}];
                          return typeof value === 'number' ? value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : value;
                        })()}</div>
                        <div class="label-cell">${label}</div>
                        ${rowIdx === 0 ? `<div class="label-cell" style="font-size: 10px; color: #999;">عدد الفواتير: \${gridValues.counts[${colIdx}] || 0}</div>` : ''}
                        ${rowIdx === 1 && colIdx === 3 ? `<div class="label-cell" style="font-size: 10px; color: #999;">عدد المرتجعات: \${gridValues.counts[3] || 0}</div>` : ''}
                      </td>
                    `).join('')}
                  </tr>
                `).join('')}
              </tbody>
            </table>
            
            <div style="display: flex; justify-content: space-around; margin: 20px 0;">
              <div style="background: #e3f2fd; padding: 10px 20px; border-radius: 5px; text-align: center;">
                <div style="font-size: 11px; color: #555;">إجمالي المبيعات</div>
                <div style="font-weight: bold; font-size: 16px;">\${(() => {
                  const total = gridValues.sales.reduce((a, b) => a + b, 0);
                  return total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                })()} ريال سعودي</div>
              </div>

              <div style="background: #e8f5e9; padding: 10px 20px; border-radius: 5px; text-align: center;">
                <div style="font-size: 11px; color: #555;">عدد المرتجعات</div>
                <div style="font-weight: bold; font-size: 16px;">\${gridValues.counts[3] || 0}</div>
              </div>
              <div style="background: #fff3e0; padding: 10px 20px; border-radius: 5px; text-align: center;">
                <div style="font-size: 11px; color: #555;">الصافي النهائي</div>
                <div style="font-weight: bold; font-size: 16px;">\${(() => {
                  const total = gridValues.net.reduce((a, b) => a + b, 0);
                  return total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                })()} ريال سعودي</div>
              </div>
            </div>
            
            <div class="print-footer">
              <div class="print-date" style="direction: rtl; text-align: right;">
                <i class="far fa-clock" style="margin-left: 6px;"></i> طبع في: ${printDateStr}
              </div>
              <div style="text-align: center; font-size: 11px; color: #777;">
                <i class="fas fa-lock"></i> وثيقة سرية - للمعاينة الداخلية فقط
              </div>
              <div style="text-align: left; direction: ltr; font-size: 11px; color: #777;">
                Page 1 of 1
              </div>
            </div>
            
            <div class="signature">
              <div class="signature-line"></div>
              <div style="margin-top: 5px;">التوقيع / Signature</div>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
      }, 500);
    }
  };

  const userName = '';
  const branchName = React.useMemo(() => {
    if (!branchId) return '';
    const branchObj = branches.find(b => String(b.id) === String(branchId));
    return branchObj ? branchObj.name : '';
  }, [branchId, branches]);

  return (
    <>
      <Helmet>
        <title>تقارير المبيعات اليومية | ERP90</title>
        <meta name="description" content="صفحة تقارير المبيعات اليومية في نظام ERP90 لعرض وتحليل المبيعات اليومية حسب الفروع والتواريخ." />
        <meta name="keywords" content="ERP, تقارير, مبيعات, يومية, فروع, تحليل, ERP90" />
      </Helmet>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen bg-gray-100 flex flex-col items-center py-4 px-2 md:py-8 md:px-4"
      >
        <div className="w-full max-w-full">

                <div className="p-4 font-['Tajawal'] bg-white mb-4 rounded-lg shadow-[0_0_10px_rgba(0,0,0,0.1)] relative overflow-hidden">
        <div className="flex items-center">
          {/* Invoice Icon */}
          <svg className="h-8 w-8 text-green-600 ml-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="2" fill="none" />
            <line x1="8" y1="8" x2="16" y2="8" stroke="currentColor" strokeWidth="2" />
            <line x1="8" y1="12" x2="16" y2="12" stroke="currentColor" strokeWidth="2" />
            <line x1="8" y1="16" x2="12" y2="16" stroke="currentColor" strokeWidth="2" />
          </svg>
          <h1 className="text-2xl font-bold text-gray-800">تقارير المبيعات اليومية</h1>
        </div>
        <p className="text-gray-600 mt-2">مبيعات اليوم والفترة الحالية </p>
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-blue-500"></div>
      </div>

          <Breadcrumb
            items={[
              { label: "الرئيسية", to: "/" },
          { label: "إدارة المبيعات", to: "/management/sales" },
              { label: "تقارير المبيعات اليومية" }
            ]}
          />
        </div>

        <div className="bg-white rounded-lg shadow p-4 md:p-6 w-full max-w-full">
          {/* Filters Row - Responsive Grid */}
          <Form layout="vertical" className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-8 gap-3 mb-6 items-end">
            <Form.Item label="من تاريخ" className="mb-0">
              <DatePicker 
                className="w-full"
                popupStyle={{ direction: 'rtl' }}
                locale={customArEg}
                value={dateFrom}
                onChange={v => setDateFrom(v)}
              />
            </Form.Item>
            
            <Form.Item label="وقت" className="mb-0">
              <TimePicker 
                locale={arEG}
                className="w-full"
                value={timeFrom}
                onChange={v => setTimeFrom(v)}
              />
            </Form.Item>
            
            <Form.Item label="إلى تاريخ" className="mb-0">
              <DatePicker 
                className="w-full"
                popupStyle={{ direction: 'rtl' }}
                locale={customArEg}
                value={dateTo}
                onChange={v => setDateTo(v)}
              />
            </Form.Item>
            
            <Form.Item label="وقت" className="mb-0">
              <TimePicker 
                locale={arEG}
                className="w-full"
                value={timeTo}
                onChange={v => setTimeTo(v)}
              />
            </Form.Item>
            
            <Form.Item label="الفرع" className="mb-0">
              <Select
                className="w-full"
                loading={branchesLoading}
                value={branchId}
                onChange={v => setBranchId(v)}
                options={[
                  { value: '', label: 'اختر الفرع' },
                  ...branches.map(branch => ({ value: branch.id, label: branch.name }))
                ]}
              />
            </Form.Item>
            
            <Form.Item label="طريقة الدفع" className="mb-0">
              <Select
                className="w-full"
                value={paymentMethodFilter}
                onChange={v => setPaymentMethodFilter(v)}
                options={[
                  { value: '', label: 'جميع طرق الدفع' },
                  ...paymentMethods.map(method => ({ value: method, label: method }))
                ]}
              />
            </Form.Item>
            
            <div className="col-span-1 sm:col-span-2 md:col-span-3 lg:col-span-2 flex flex-col sm:flex-row items-center justify-center gap-2 mt-2 sm:mt-0">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full">
                <Button 
                  type="primary"
                  className="w-full h-9 text-lg  bg-blue-600 rounded-xl shadow-md"
                  loading={loading}
                  onClick={() => fetchData({ dateFrom, dateTo, branchId, timeFrom, timeTo, paymentMethodFilter })}
                >
                  بحث
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full">
                <Button
                  type="primary"
                  className="w-full h-9 text-lg  bg-blue-600 flex items-center justify-center gap-3 rounded-xl shadow-md"
                  icon={<PrinterOutlined style={{ fontSize: 20 }} />}
                  onClick={handlePrint}
                >
                  طباعة
                </Button>
                
              </motion.div>
            </div>
          </Form>

          {/* Grid Section - Responsive */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 border rounded-lg bg-gray-50 p-2"
          >
            {gridLabels[0].map((label, colIdx) => {
              const showVisaIcon = label === "مبيعات التحويلات";
              const value = gridValues.sales[colIdx];
              const count = gridValues.counts[colIdx];
              return (
                <motion.div
                  key={label}
                  whileHover={{ scale: 1.03, boxShadow: "0px 5px 15px rgba(0,0,0,0.1)" }}
                  className="flex flex-col items-center justify-center border rounded bg-white min-h-[90px] p-2"
                >
                  <span className="font-bold text-lg md:text-xl text-gray-800 mb-1 flex items-center gap-1">
                    {typeof value === 'number' ? value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : value}
                    {showVisaIcon && <CreditCardOutlined className="text-black text-xl" />}
                  </span>
                  <span className="text-sm md:text-base text-gray-700 font-bold text-center">{label}</span>
                  <span className="text-xs text-gray-500 mt-1">
                    عدد الفواتير: {count || 0}
                  </span>
                </motion.div>
              );
            })}
          </motion.div>

          {/* جدول مبيعات الفروع داخل الصفحة وليس الطباعة */}
          <div className="mt-8">
            {/* <h2 className="text-lg font-bold mb-4 text-blue-700">جدول مبيعات الفروع</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                <thead>
                  <tr className="bg-blue-50">
                    <th className="px-3 py-2 border">الفرع</th>
                    <th className="px-3 py-2 border">إجمالي المبيعات</th>
                    <th className="px-3 py-2 border">إجمالي الخصم</th>
                    <th className="px-3 py-2 border">إجمالي الضريبة</th>
                    <th className="px-3 py-2 border">الصافي</th>
                    <th className="px-3 py-2 border">عدد الفواتير</th>
                  </tr>
                </thead>
                <tbody>
                  {branchSales.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-4 text-gray-400">لا توجد بيانات للفروع</td></tr>
                  ) : (
                    branchSales.map((branch, idx) => (
                      <tr key={branch.branchId || idx} className="hover:bg-blue-50">
                        <td className="px-3 py-2 border font-bold text-gray-700">{branch.branchName}</td>
                        <td className="px-3 py-2 border text-green-700 font-semibold">{branch.totalSales.toLocaleString()} ر.س</td>
                        <td className="px-3 py-2 border text-orange-600 font-semibold">{branch.totalDiscount.toLocaleString()} ر.س</td>
                        <td className="px-3 py-2 border text-blue-600 font-semibold">{branch.totalTax.toLocaleString()} ر.س</td>
                        <td className="px-3 py-2 border text-purple-600 font-bold">{branch.netTotal.toLocaleString()} ر.س</td>
                        <td className="px-3 py-2 border text-gray-700">{branch.invoiceCount}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div> */}
            {/* رسم بياني لمبيعات الفروع */}

{/* رسم بياني لمبيعات الفروع */}
{branchChartData.length > 0 && (
  <div className="mt-8">
    <h3 className="text-md font-bold mb-4 text-blue-600">
      رسم بياني لمبيعات الفروع
    </h3>

    <div style={{ width: '100%', height: 350 }}>
      <ResponsiveContainer width="100%" height={350}>
        <LineChart
          data={branchChartData}
          margin={{ top: 20, right: 30, left: 0, bottom: 40 }}
        >
          <XAxis
            dataKey="branchName"
            angle={0}
            textAnchor="middle"
            interval={0}
            height={60}
            tick={{ fontSize: 14, dy: 10 }}
          />
          <YAxis
            tick={{ fontSize: 16, textAnchor: 'start', dx: 0, dy: 0 }}
          />
          <Tooltip formatter={(value) => `${value.toLocaleString()} ر.س`} />
          <Legend verticalAlign="top" height={36} />
          <Line type="monotone" dataKey="totalSales" stroke="#0088FE" name="إجمالي المبيعات" strokeWidth={3} dot={{ r: 5 }} />
          <Line type="monotone" dataKey="netTotal" stroke="#82ca9d" name="الصافي" strokeWidth={3} dot={{ r: 5 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  </div>
)}

            {/* رسم بياني لمبيعات السنة حسب الأشهر */}
            {annualChartData.length > 0 && (
              <div className="mt-8">
                <h3 className="text-md font-bold mb-4 text-blue-700">رسم بياني لمبيعات السنة حسب الأشهر</h3>
                <div style={{ width: '100%', height: 350 }}>
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart
                      data={annualChartData}
                      margin={{ top: 20, right: 30, left: 0, bottom: 40 }}
                    >
                      <XAxis dataKey="month" tick={{ fontSize: 14 }} />
                      <YAxis tick={{ fontSize: 16, textAnchor: 'start', dx: 0, dy: 0 }} />
                      <Tooltip formatter={(value: number, name: string) => name === 'totalSales' || name === 'netTotal' ? value.toLocaleString() + ' ر.س' : value.toLocaleString()} />
                      <Legend />
                      <Bar dataKey="totalSales" fill="#4CAF50" name="إجمالي المبيعات" />
                      <Bar dataKey="netTotal" fill="#0088FE" name="الصافي" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* رسم بياني لمبيعات الأصناف الأكثر مبيعاً */}
            {itemChartData.length > 0 && (
              <div className="mt-8">
                <h3 className="text-md font-bold mb-2 text-orange-600">رسم بياني لأكثر الأصناف مبيعاً</h3>
                <div style={{ width: '100%', height: 350 }}>
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart
                      data={itemChartData}
                      layout="vertical"
                      margin={{ top: 20, right: 30, left: 40, bottom: 40 }}
                    >
                      <XAxis type="number" tick={{ fontSize: 14 }} />
                      <YAxis dataKey="itemName" type="category" width={220} tick={{ fontSize: 16, textAnchor: 'start', dx: 0, dy: 0 }} tickFormatter={(name) => name.length > 25 ? name.slice(0, 25) + '...' : name} />
                      {/* Tooltip لعرض الاسم الكامل عند المرور */}
                      <Tooltip formatter={(value: number, name: string, props) => {
                        if (props && props.payload && props.payload.itemName) {
                          return [name === 'totalSales' ? value.toLocaleString() + ' ر.س' : value.toLocaleString(), props.payload.itemName];
                        }
                        return name === 'totalSales' ? value.toLocaleString() + ' ر.س' : value.toLocaleString();
                      }} labelFormatter={(label) => label} />
                      <Tooltip formatter={(value: number, name: string) => name === 'totalSales' ? value.toLocaleString() + ' ر.س' : value.toLocaleString()} />
                      <Legend />
                      <Bar dataKey="totalQty" fill="#0088FE" name="الكمية المباعة" />
                      <Bar dataKey="totalSales" fill="#FF9800" name="إجمالي المبيعات" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
            {/* رسم بياني لمبيعات المناديب الأكثر نشاطاً */}
            {repChartData.length > 0 && (
              <div className="mt-8">
                <h3 className="text-md font-bold mb-2 text-purple-600">رسم بياني لمبيعات المناديب الأكثر نشاطاً</h3>
                <div style={{ width: '100%', height: 350 }}>
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart
                      data={repChartData}
                      layout="vertical"
                      margin={{ top: 20, right: 30, left: 40, bottom: 40 }}
                    >
                      <XAxis type="number" tick={{ fontSize: 14 }} />
                      <YAxis dataKey="repName" type="category" width={120} tick={{ fontSize: 14 }} />
                      <Tooltip formatter={(value: number, name: string) => name === 'totalSales' ? value.toLocaleString() + ' ر.س' : value.toLocaleString()} />
                      <Legend />
                      <Bar dataKey="totalSales" fill="#7C3AED" name="إجمالي المبيعات" />
                      <Bar dataKey="invoiceCount" fill="#F59E42" name="عدد الفواتير" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default DailySales;