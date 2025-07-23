import "./hide-datepicker-weekdays.css";
import React from "react";
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
import { useEffect, useState } from "react";

import { fetchBranches, Branch } from "@/lib/branches";
import dayjs, { Dayjs } from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

const { RangePicker } = DatePicker;

const gridLabels = [
  [
    "عدد الفواتير النقدية",
    "عدد الفواتير الآجلة",
    "إجمالي عدد الفواتير",
    "عدد مردود المبيعات",
    "الفواتير + المردودات",
  ],
  [
    "إجمالي المبيعات نقداً",
    "إجمالي المبيعات شبكة",
    "إجمالي المبيعات الآجلة",
    "إجمالي المبيعات",
    "إجمالي المردود نقداً",
  ],
  [
    "إجمالي المردودات شبكة",
    "إجمالي مردودات المبيعات",
    "صافي المبيعات نقداً",
    "صافي المبيعات شبكة",
    "الصافي",
  ],
];

import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

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
  const [branches, setBranches] = useState<Branch[]>([]);
  const [branchesLoading, setBranchesLoading] = useState(true);
  const [salesInvoices, setSalesInvoices] = useState<any[]>([]);
  const [salesReturns, setSalesReturns] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [dateFrom, setDateFrom] = useState<any>(null);
  const [dateTo, setDateTo] = useState<any>(null);
  const [timeFrom, setTimeFrom] = useState<any>(null);
  const [timeTo, setTimeTo] = useState<any>(null);
  const [branchId, setBranchId] = useState<string>('');
  const [companyData, setCompanyData] = useState<any>({});

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
    dateFrom?: any;
    dateTo?: any;
    branchId?: string;
    timeFrom?: Dayjs | null;
    timeTo?: Dayjs | null;
  };

  const fetchData = async (filters?: Filters) => {
    setLoading(true);
    try {
      const invoicesSnap = await getDocs(collection(db, 'sales_invoices'));
      let invoices = invoicesSnap.docs.map(doc => doc.data());
      const returnsSnap = await getDocs(collection(db, 'sales_returns'));
      let returns = returnsSnap.docs.map(doc => doc.data());
      
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
        
        const normalizeDate = (val: any) => {
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
      }
      setSalesInvoices(invoices);
      setSalesReturns(returns);
    } catch (e) {
      setSalesInvoices([]);
      setSalesReturns([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const gridValues = React.useMemo(() => {
    let cashCount = 0, networkCount = 0, creditCount = 0, totalCount = 0, returnCount = 0;
    let cashTotal = 0, networkTotal = 0, creditTotal = 0, totalSales = 0;
    let returnCash = 0, returnNetwork = 0, totalReturns = 0;
    let netCash = 0, netNetwork = 0, netTotal = 0;

    const findMethod = (keywords: string[]) =>
      paymentMethods.find(n => n && keywords.some(keyword => n.toString().replace(/\s/g, '').toLowerCase().includes(keyword))) || '';
    const cashName = findMethod(['نقد']);
    const networkName = findMethod(['شبك']);
    const creditName = findMethod(['آجل', 'اجل']);

    salesInvoices.forEach(inv => {
      if (!Array.isArray(inv.items)) return;
      const method = inv.paymentMethod;
      const invoiceTotal = inv.totals?.afterTax || 0;
      
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
        creditTotal += invoiceTotal;
      }
      totalCount++;
      totalSales += invoiceTotal;
    });

    salesReturns.forEach(ret => {
      returnCount++;
      const method = ret.paymentMethod;
      let retTotal = 0;
      if (ret.totals && typeof ret.totals.afterTax === 'number') retTotal = ret.totals.afterTax;
      else if (ret.totals && typeof ret.totals.total === 'number') retTotal = ret.totals.total;
      else if (typeof ret.amount === 'number') retTotal = ret.amount;
      else if (typeof ret.total === 'number') retTotal = ret.total;
      
      if (cashName && method && /^نقد/.test(method.replace(/\s/g, '').toLowerCase())) returnCash += retTotal;
      else if (networkName && method && method.replace(/\s/g, '').toLowerCase().includes('شبك')) returnNetwork += retTotal;
      else if (creditName && method && (method.replace(/\s/g, '').toLowerCase().includes('آجل') || method.replace(/\s/g, '').toLowerCase().includes('اجل'))) creditTotal -= retTotal;
      totalReturns += retTotal;
    });

    netCash = cashTotal - returnCash;
    netNetwork = networkTotal - returnNetwork;
    netTotal = totalSales - totalReturns;

    return [
      [cashCount, creditCount, totalCount, returnCount, totalCount + returnCount],
      [cashTotal, networkTotal, creditTotal, totalSales, returnCash],
      [returnNetwork, totalReturns, netCash, netNetwork, netTotal]
    ];
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
                    <th>${String.fromCharCode(1632 + colIdx)}</th>
                  `).join('')}
                </tr>
              </thead>
              <tbody>
                ${gridLabels.map((row, rowIdx) => `
                  <tr ${rowIdx === gridLabels.length - 1 ? 'class="total-row"' : ''}>
                    ${row.map((label, colIdx) => `
                      <td>
                        <div class="value-cell">${typeof gridValues[rowIdx]?.[colIdx] === 'number' ? 
                          gridValues[rowIdx][colIdx].toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : 
                          gridValues[rowIdx][colIdx]}</div>
                        <div class="label-cell">${label}</div>
                      </td>
                    `).join('')}
                  </tr>
                `).join('')}
              </tbody>
            </table>
            
            <div style="display: flex; justify-content: space-around; margin: 20px 0;">
              <div style="background: #e3f2fd; padding: 10px 20px; border-radius: 5px; text-align: center;">
                <div style="font-size: 11px; color: #555;">إجمالي المبيعات</div>
                <div style="font-weight: bold; font-size: 16px;">${gridValues[1]?.[3]?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'} ريال سعودي</div>
              </div>
              <div style="background: #e8f5e9; padding: 10px 20px; border-radius: 5px; text-align: center;">
                <div style="font-size: 11px; color: #555;">عدد المعاملات</div>
                <div style="font-weight: bold; font-size: 16px;">${gridValues[0]?.[4] || 0}</div>
              </div>
              <div style="background: #fff3e0; padding: 10px 20px; border-radius: 5px; text-align: center;">
                <div style="font-size: 11px; color: #555;">الصافي</div>
                <div style="font-weight: bold; font-size: 16px;">${gridValues[2]?.[4]?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'} ريال سعودي</div>
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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gray-100 flex flex-col items-center py-4 px-2 md:py-8 md:px-4"
    >
      <div className="w-full max-w-full">
        <div className="p-4 font-['Tajawal'] bg-white rounded-lg shadow-[0_0_10px_rgba(0,0,0,0.1)] mb-4 relative overflow-hidden">
          <div className="flex items-center">
            <h1 className="text-xl md:text-2xl font-bold text-blue-800">تقارير المبيعات اليومية</h1>
            <span className="animate-[wave_2s_infinite] text-2xl md:text-3xl mr-3">👋</span>
          </div>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-purple-500 animate-[pulse_3s_infinite]"></div>
        </div>

        <style>{`
          @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-5px); }
          }
          @keyframes wave {
            0%, 100% { transform: rotate(0deg); }
            25% { transform: rotate(20deg); }
            75% { transform: rotate(-20deg); }
          }
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}</style>

        <Breadcrumb
          items={[
            { label: "الرئيسية", to: "/" },
            { label: "التقارير" },
            { label: "تقارير المبيعات اليومية" }
          ]}
        />
      </div>

      <div className="bg-white rounded-lg shadow p-4 md:p-6 w-full max-w-full">
        {/* Filters Row - Responsive Grid */}
        <Form layout="vertical" className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-3 mb-6 items-end">
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
          
          <div className="col-span-1 sm:col-span-2 md:col-span-3 lg:col-span-2 flex flex-col sm:flex-row items-center justify-center gap-2 mt-2 sm:mt-0">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full">
              <Button 
                type="primary"
                className="w-full h-9 text-lg  bg-blue-600 rounded-xl shadow-md"
                loading={loading}
                onClick={() => fetchData({ dateFrom, dateTo, branchId, timeFrom, timeTo })}
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
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 border rounded-lg bg-gray-50 p-2"
        >
          {gridLabels.map((row, rowIdx) =>
            row.map((label, colIdx) => {
              const showVisaIcon =
                label === "عدد الفواتير الآجلة" || label === "إجمالي المبيعات الآجلة";
              const value = gridValues[rowIdx]?.[colIdx] ?? 0;
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
                </motion.div>
              );
            })
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default DailySales;