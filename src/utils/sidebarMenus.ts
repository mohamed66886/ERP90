import React from 'react';
import { 
  FaHome, FaCog, FaExchangeAlt, FaChartBar, FaFileInvoiceDollar, 
  FaUndo, FaFileInvoice, FaUndoAlt, FaWarehouse, FaBoxes, FaCubes, 
  FaUsers, FaUserTie, FaUserFriends, FaUserCheck, FaUserShield, 
  FaBuilding, FaMoneyCheckAlt, FaSlidersH, FaServer, FaCloudUploadAlt, 
  FaQuestionCircle, FaTasks, FaWallet, FaChartPie, FaMoneyBillWave,
  FaCalculator, FaProjectDiagram, FaClipboardList, FaCalendarAlt,
  FaShoppingCart, FaFileContract, FaHandshake, FaGavel,
  FaCog as FaGear, FaWrench, FaIndustry, FaFileAlt
} from "react-icons/fa";
import { SectionType } from '../contexts/SidebarContext';

export interface MenuItem {
  label: string;
  icon: React.ReactNode;
  path?: string;
  hasSubmenu?: boolean;
  submenu?: MenuItem[];
}

export interface SidebarMenus {
  [key: string]: MenuItem[];
}

export const getSidebarMenus = (section: SectionType): MenuItem[] => {
  const commonItems = [
    { label: "الصفحة الرئيسية", icon: React.createElement(FaHome), path: "/" }
  ];

  switch (section) {
    case 'financial':
      return [
        ...commonItems,
        { 
          label: "الحسابات المالية", 
          icon: React.createElement(FaWallet, { className: "text-blue-500" }), 
          hasSubmenu: true,
          submenu: [
            { label: "دليل الحسابات", icon: React.createElement(FaFileAlt), path: "/financial/accounts" },
            { label: "حسابات العملاء", icon: React.createElement(FaUsers), path: "/financial/customers-accounts" },
            { label: "حسابات الموردين", icon: React.createElement(FaUserTie), path: "/financial/suppliers-accounts" },
            { label: "الخزائن والبنوك", icon: React.createElement(FaBuilding), path: "/financial/treasuries" }
          ]
        },
        { 
          label: "العمليات المالية", 
          icon: React.createElement(FaMoneyBillWave, { className: "text-green-500" }), 
          hasSubmenu: true,
          submenu: [
            { label: "قيد يومية", icon: React.createElement(FaFileInvoiceDollar), path: "/financial/daily-entry" },
            { label: "قيد تسوية", icon: React.createElement(FaCalculator), path: "/financial/adjustment" },
            { label: "قيد إقفال", icon: React.createElement(FaFileInvoice), path: "/financial/closing" },
            { label: "سندات قبض", icon: React.createElement(FaMoneyCheckAlt), path: "/financial/receipts" },
            { label: "سندات صرف", icon: React.createElement(FaMoneyBillWave), path: "/financial/payments" }
          ]
        },
        { 
          label: "التقارير المالية", 
          icon: React.createElement(FaChartPie, { className: "text-purple-500" }), 
          hasSubmenu: true,
          submenu: [
            { label: "الميزان العمومي", icon: React.createElement(FaChartBar), path: "/financial/balance-sheet" },
            { label: "قائمة الدخل", icon: React.createElement(FaChartPie), path: "/financial/income-statement" },
            { label: "قائمة التدفقات النقدية", icon: React.createElement(FaMoneyBillWave), path: "/financial/cash-flow" },
            { label: "كشف حساب", icon: React.createElement(FaFileInvoice), path: "/financial/account-statement" }
          ]
        }
      ];

    case 'hr':
      return [
        ...commonItems,
        { 
          label: "إدارة الموظفين", 
          icon: React.createElement(FaUserTie, { className: "text-blue-500" }), 
          hasSubmenu: true,
          submenu: [
            { label: "بيانات الموظفين", icon: React.createElement(FaUsers), path: "/hr/employees" },
            { label: "الأقسام والوظائف", icon: React.createElement(FaBuilding), path: "/hr/departments" },
            { label: "الحضور والانصراف", icon: React.createElement(FaCalendarAlt), path: "/hr/attendance" },
            { label: "الإجازات", icon: React.createElement(FaCalendarAlt), path: "/hr/leaves" }
          ]
        },
        { 
          label: "الرواتب والمكافآت", 
          icon: React.createElement(FaMoneyBillWave, { className: "text-green-500" }), 
          hasSubmenu: true,
          submenu: [
            { label: "إعداد الرواتب", icon: React.createElement(FaCalculator), path: "/hr/salary-setup" },
            { label: "صرف الرواتب", icon: React.createElement(FaMoneyCheckAlt), path: "/hr/payroll" },
            { label: "البدلات والخصومات", icon: React.createElement(FaMoneyBillWave), path: "/hr/allowances" },
            { label: "المكافآت والحوافز", icon: React.createElement(FaFileInvoiceDollar), path: "/hr/bonuses" }
          ]
        },
        { 
          label: "تقارير الموارد البشرية", 
          icon: React.createElement(FaChartBar, { className: "text-purple-500" }), 
          hasSubmenu: true,
          submenu: [
            { label: "تقرير الحضور", icon: React.createElement(FaCalendarAlt), path: "/hr/attendance-report" },
            { label: "تقرير الرواتب", icon: React.createElement(FaMoneyBillWave), path: "/hr/payroll-report" },
            { label: "تقرير الإجازات", icon: React.createElement(FaFileAlt), path: "/hr/leaves-report" }
          ]
        }
      ];

    case 'warehouse':
      return [
        ...commonItems,
        { 
          label: "إدارة المخازن", 
          icon: React.createElement(FaWarehouse, { className: "text-blue-500" }), 
          hasSubmenu: true,
          submenu: [
            { label: "المخازن", icon: React.createElement(FaWarehouse), path: "/warehouse/stores" },
            { label: "الأصناف", icon: React.createElement(FaBoxes), path: "/warehouse/items" },
            { label: "المخزون", icon: React.createElement(FaCubes), path: "/warehouse/inventory" },
            { label: "حركة المخزون", icon: React.createElement(FaExchangeAlt), path: "/warehouse/movements" }
          ]
        },
        { 
          label: "عمليات المخزون", 
          icon: React.createElement(FaExchangeAlt, { className: "text-green-500" }), 
          hasSubmenu: true,
          submenu: [
            { label: "أذن إدخال", icon: React.createElement(FaFileInvoice), path: "/warehouse/inward" },
            { label: "أذن إخراج", icon: React.createElement(FaFileInvoice), path: "/warehouse/outward" },
            { label: "تحويل بين المخازن", icon: React.createElement(FaExchangeAlt), path: "/warehouse/transfer" },
            { label: "جرد المخزون", icon: React.createElement(FaClipboardList), path: "/warehouse/stock-take" }
          ]
        },
        { 
          label: "تقارير المخازن", 
          icon: React.createElement(FaChartBar, { className: "text-purple-500" }), 
          hasSubmenu: true,
          submenu: [
            { label: "تقرير المخزون الحالي", icon: React.createElement(FaCubes), path: "/warehouse/current-stock" },
            { label: "تقرير حركة الأصناف", icon: React.createElement(FaExchangeAlt), path: "/warehouse/item-movements" },
            { label: "تقرير الأصناف الناقصة", icon: React.createElement(FaBoxes), path: "/warehouse/low-stock" }
          ]
        }
      ];

    case 'projects':
      return [
        ...commonItems,
        { 
          label: "إدارة المشاريع", 
          icon: React.createElement(FaProjectDiagram, { className: "text-blue-500" }), 
          hasSubmenu: true,
          submenu: [
            { label: "المشاريع", icon: React.createElement(FaProjectDiagram), path: "/projects/list" },
            { label: "المهام", icon: React.createElement(FaTasks), path: "/projects/tasks" },
            { label: "الموارد", icon: React.createElement(FaUsers), path: "/projects/resources" },
            { label: "الجدول الزمني", icon: React.createElement(FaCalendarAlt), path: "/projects/timeline" }
          ]
        },
        { 
          label: "متابعة المشاريع", 
          icon: React.createElement(FaClipboardList, { className: "text-green-500" }), 
          hasSubmenu: true,
          submenu: [
            { label: "حالة المشاريع", icon: React.createElement(FaClipboardList), path: "/projects/status" },
            { label: "المراحل المنجزة", icon: React.createElement(FaCalendarAlt), path: "/projects/milestones" },
            { label: "التكاليف والميزانية", icon: React.createElement(FaMoneyBillWave), path: "/projects/budget" }
          ]
        },
        { 
          label: "تقارير المشاريع", 
          icon: React.createElement(FaChartBar, { className: "text-purple-500" }), 
          hasSubmenu: true,
          submenu: [
            { label: "تقرير أداء المشاريع", icon: React.createElement(FaChartPie), path: "/projects/performance" },
            { label: "تقرير التكاليف", icon: React.createElement(FaMoneyBillWave), path: "/projects/costs" },
            { label: "تقرير الموارد", icon: React.createElement(FaUsers), path: "/projects/resources-report" }
          ]
        }
      ];

    case 'sales':
      return [
        ...commonItems,
        { 
          label: "إدارة المبيعات", 
          icon: React.createElement(FaShoppingCart, { className: "text-blue-500" }), 
          hasSubmenu: true,
          submenu: [
            { label: "فواتير المبيعات", icon: React.createElement(FaFileInvoiceDollar), path: "/sales/invoices" },
            { label: "عروض الأسعار", icon: React.createElement(FaFileAlt), path: "/sales/quotations" },
            { label: "أوامر البيع", icon: React.createElement(FaClipboardList), path: "/sales/orders" },
            { label: "مرتجع المبيعات", icon: React.createElement(FaUndo), path: "/sales/returns" }
          ]
        },
        { 
          label: "إدارة العملاء", 
          icon: React.createElement(FaUserFriends, { className: "text-green-500" }), 
          hasSubmenu: true,
          submenu: [
            { label: "بيانات العملاء", icon: React.createElement(FaUsers), path: "/sales/customers" },
            { label: "كشف حساب عميل", icon: React.createElement(FaFileInvoice), path: "/sales/customer-statement" },
            { label: "حدود الائتمان", icon: React.createElement(FaMoneyCheckAlt), path: "/sales/credit-limits" }
          ]
        },
        { 
          label: "تقارير المبيعات", 
          icon: React.createElement(FaChartBar, { className: "text-purple-500" }), 
          hasSubmenu: true,
          submenu: [
            { label: "تقرير المبيعات اليومية", icon: React.createElement(FaChartBar), path: "/sales/daily-report" },
            { label: "تقرير أرباح الفواتير", icon: React.createElement(FaMoneyBillWave), path: "/sales/profit-report" },
            { label: "تقرير مبيعات العملاء", icon: React.createElement(FaUsers), path: "/sales/customer-sales" }
          ]
        }
      ];

    case 'purchase':
      return [
        ...commonItems,
        { 
          label: "إدارة المشتريات", 
          icon: React.createElement(FaShoppingCart, { className: "text-blue-500" }), 
          hasSubmenu: true,
          submenu: [
            { label: "فواتير المشتريات", icon: React.createElement(FaFileInvoice), path: "/purchase/invoices" },
            { label: "طلبات الشراء", icon: React.createElement(FaClipboardList), path: "/purchase/orders" },
            { label: "عروض الموردين", icon: React.createElement(FaFileAlt), path: "/purchase/supplier-quotes" },
            { label: "مرتجع المشتريات", icon: React.createElement(FaUndoAlt), path: "/purchase/returns" }
          ]
        },
        { 
          label: "إدارة الموردين", 
          icon: React.createElement(FaUserCheck, { className: "text-green-500" }), 
          hasSubmenu: true,
          submenu: [
            { label: "بيانات الموردين", icon: React.createElement(FaUserTie), path: "/purchase/suppliers" },
            { label: "كشف حساب مورد", icon: React.createElement(FaFileInvoice), path: "/purchase/supplier-statement" },
            { label: "تقييم الموردين", icon: React.createElement(FaChartBar), path: "/purchase/supplier-evaluation" }
          ]
        },
        { 
          label: "تقارير المشتريات", 
          icon: React.createElement(FaChartBar, { className: "text-purple-500" }), 
          hasSubmenu: true,
          submenu: [
            { label: "تقرير المشتريات", icon: React.createElement(FaFileInvoice), path: "/purchase/purchase-report" },
            { label: "تقرير الموردين", icon: React.createElement(FaUserTie), path: "/purchase/supplier-report" },
            { label: "تحليل المشتريات", icon: React.createElement(FaChartPie), path: "/purchase/analysis" }
          ]
        }
      ];

    case 'contracts':
      return [
        ...commonItems,
        { 
          label: "إدارة العقود", 
          icon: React.createElement(FaFileContract, { className: "text-blue-500" }), 
          hasSubmenu: true,
          submenu: [
            { label: "العقود", icon: React.createElement(FaFileContract), path: "/contracts/list" },
            { label: "أنواع العقود", icon: React.createElement(FaFileAlt), path: "/contracts/types" },
            { label: "بنود العقود", icon: React.createElement(FaClipboardList), path: "/contracts/terms" },
            { label: "تجديد العقود", icon: React.createElement(FaUndo), path: "/contracts/renewals" }
          ]
        },
        { 
          label: "إدارة المناقصات", 
          icon: React.createElement(FaGavel, { className: "text-green-500" }), 
          hasSubmenu: true,
          submenu: [
            { label: "المناقصات", icon: React.createElement(FaGavel), path: "/contracts/tenders" },
            { label: "عروض المناقصات", icon: React.createElement(FaFileAlt), path: "/contracts/tender-offers" },
            { label: "تقييم العروض", icon: React.createElement(FaChartBar), path: "/contracts/offer-evaluation" }
          ]
        },
        { 
          label: "تقارير العقود", 
          icon: React.createElement(FaChartBar, { className: "text-purple-500" }), 
          hasSubmenu: true,
          submenu: [
            { label: "تقرير العقود", icon: React.createElement(FaFileContract), path: "/contracts/report" },
            { label: "العقود المنتهية", icon: React.createElement(FaCalendarAlt), path: "/contracts/expired" },
            { label: "العقود القريبة من الانتهاء", icon: React.createElement(FaCalendarAlt), path: "/contracts/expiring" }
          ]
        }
      ];

    case 'equipment':
      return [
        ...commonItems,
        { 
          label: "إدارة المعدات", 
          icon: React.createElement(FaGear, { className: "text-blue-500" }), 
          hasSubmenu: true,
          submenu: [
            { label: "المعدات", icon: React.createElement(FaGear), path: "/equipment/list" },
            { label: "أنواع المعدات", icon: React.createElement(FaWrench), path: "/equipment/types" },
            { label: "مواقع المعدات", icon: React.createElement(FaBuilding), path: "/equipment/locations" },
            { label: "حالة المعدات", icon: React.createElement(FaClipboardList), path: "/equipment/status" }
          ]
        },
        { 
          label: "الصيانة والإصلاح", 
          icon: React.createElement(FaWrench, { className: "text-green-500" }), 
          hasSubmenu: true,
          submenu: [
            { label: "جدولة الصيانة", icon: React.createElement(FaCalendarAlt), path: "/equipment/maintenance-schedule" },
            { label: "أوامر العمل", icon: React.createElement(FaClipboardList), path: "/equipment/work-orders" },
            { label: "قطع الغيار", icon: React.createElement(FaBoxes), path: "/equipment/spare-parts" },
            { label: "تاريخ الصيانة", icon: React.createElement(FaFileAlt), path: "/equipment/maintenance-history" }
          ]
        },
        { 
          label: "الوحدات الإنتاجية", 
          icon: React.createElement(FaIndustry, { className: "text-orange-500" }), 
          hasSubmenu: true,
          submenu: [
            { label: "خطوط الإنتاج", icon: React.createElement(FaIndustry), path: "/equipment/production-lines" },
            { label: "أداء الإنتاج", icon: React.createElement(FaChartBar), path: "/equipment/production-performance" },
            { label: "التوقفات", icon: React.createElement(FaCalendarAlt), path: "/equipment/downtime" }
          ]
        },
        { 
          label: "تقارير المعدات", 
          icon: React.createElement(FaChartBar, { className: "text-purple-500" }), 
          hasSubmenu: true,
          submenu: [
            { label: "تقرير حالة المعدات", icon: React.createElement(FaGear), path: "/equipment/status-report" },
            { label: "تقرير الصيانة", icon: React.createElement(FaWrench), path: "/equipment/maintenance-report" },
            { label: "تقرير الإنتاجية", icon: React.createElement(FaChartPie), path: "/equipment/productivity-report" }
          ]
        }
      ];

    default:
      return [
        ...commonItems,
        { 
          label: "الإعدادات الأساسية", 
          icon: React.createElement(FaCog, { className: "text-blue-500" }), 
          hasSubmenu: true,
          submenu: [
            { label: "ادارة الفروع", icon: React.createElement(FaBuilding), path: "/business/branches" },
            { label: "اداره طرق الدفع", icon: React.createElement(FaMoneyCheckAlt), path: "/business/payment-methods" },
            { label: "الاعدادات العامة", icon: React.createElement(FaSlidersH), path: "/settings" },
            { label: "النظام", icon: React.createElement(FaServer), path: "/system" },
            { label: "النسخ الاحطياطي", icon: React.createElement(FaCloudUploadAlt), path: "/backup" },
            { label: "الاسئله الشائعه", icon: React.createElement(FaQuestionCircle), path: "/help" }
          ]
        },
        { 
          label: "العمليات", 
          icon: React.createElement(FaExchangeAlt, { className: "text-green-500" }), 
          hasSubmenu: true,
          submenu: [
            { label: "فاتورة مبيعات", icon: React.createElement(FaFileInvoiceDollar), path: "/stores/sales" },
            { label: "مرتجع مبيعات", icon: React.createElement(FaUndo), path: "/stores/sales-return" },
            { label: "فاتورة مشتريات", icon: React.createElement(FaFileInvoice), path: "/stores/purchases" },
            { label: "مرتجع مشتريات", icon: React.createElement(FaUndoAlt), path: "/stores/purchases-return" }
          ]
        },
        { 
          label: "ادارة الأفراد", 
          icon: React.createElement(FaUsers, { className: "text-purple-500" }), 
          hasSubmenu: true,
          submenu: [
            { label: "ادارة الموظفين", icon: React.createElement(FaUserTie), path: "/admin/employees" },
            { label: "ادارة العملاء", icon: React.createElement(FaUserFriends), path: "/customers" },
            { label: "ادارة الموردين", icon: React.createElement(FaUserCheck), path: "/suppliers" },
            { label: "اداره مديرين الفروع", icon: React.createElement(FaUserShield), path: "/admin/admins" }
          ]
        },
        { 
          label: "المخازن", 
          icon: React.createElement(FaWarehouse, { className: "text-orange-500" }), 
          hasSubmenu: true,
          submenu: [
            { label: "ادارة المخازن", icon: React.createElement(FaWarehouse), path: "/stores/manage" },
            { label: "ادارة الاصناف", icon: React.createElement(FaBoxes), path: "/stores/item" },
            { label: "المخزون", icon: React.createElement(FaCubes), path: "/stores/stock" }
          ]
        }
      ];
  }
};
