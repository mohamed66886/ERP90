import React, { useState, useEffect } from "react";
import {
  FaHome,
  FaStar,
  FaCog,
  FaExchangeAlt,
  FaChartBar,
  FaFileInvoice,
  FaUsers,
  FaWarehouse,
  FaTimes,
  FaChevronLeft,
} from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

// تعريف عناصر القائمة الرئيسية
const menuItems = [
  { label: "الصفحة الرئيسية", icon: <FaHome />, path: "/" },
  { label: "المفضلة", icon: <FaStar />, path: null },
  { label: "الإعدادات الأساسية", icon: <FaCog />, path: null, submenu: "settings" },
  { label: "العمليات", icon: <FaExchangeAlt />, path: null, submenu: "operations" },
  { label: "تقارير المبيعات", icon: <FaChartBar />, path: null, submenu: "sales" },
  { label: "تقارير المشتريات", icon: <FaFileInvoice />, path: null, submenu: "purchases" },
  { label: "ادارة الأفراد", icon: <FaUsers />, path: null, submenu: "people" },
  { label: "المخازن", icon: <FaWarehouse />, path: null, submenu: "stores" },
];

// تعريف واجهة الخصائص للمكون
interface MobileSidebarProps {
  open: boolean;
  onClose: () => void;
}

const MobileSidebar: React.FC<MobileSidebarProps> = ({ open, onClose }) => {
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const [isClosing, setIsClosing] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // التحكم في scroll الصفحة عند فتح/إغلاق القائمة
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // التعامل مع التنقل بين الصفحات
  const handleNavigate = (path: string) => {
    onClose();
    setActiveSubmenu(null);
    navigate(path);
  };

  // التعامل مع إغلاق القائمة مع تأثير الانتقال
  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
      setActiveSubmenu(null);
    }, 300);
  };

  // عدم عرض القائمة إذا كانت مغلقة وغير في حالة إغلاق
  if (!open && !isClosing) return null;

  return (
    <AnimatePresence>
      {(open || isClosing) && (
        <div className="fixed inset-0 z-[100] flex md:hidden">
          {/* طبقة التعتيم الخلفية */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-black"
            onClick={handleClose}
          />

          {/* القائمة الرئيسية */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className="relative z-50 w-72 h-full bg-white shadow-xl flex flex-col"
          >
            {/* زر الإغلاق */}
            <button
              className="absolute top-4 left-4 p-2 text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
              onClick={handleClose}
              aria-label="إغلاق القائمة"
            >
              <FaTimes size={20} />
            </button>

            {/* محتوى القائمة الرئيسية */}
            <nav className="flex-1 mt-16 overflow-y-auto">
              {menuItems.map((item, idx) => (
                <div key={idx} className="border-b border-gray-100 last:border-b-0">
                  <button
                    className={`w-full flex items-center justify-between px-6 py-4 text-right text-base font-medium hover:bg-blue-50 transition-colors duration-200 ${
                      item.path && location.pathname === item.path
                        ? "bg-blue-100 text-blue-700"
                        : "text-gray-700"
                    }`}
                    onClick={() => {
                      if (item.path) handleNavigate(item.path);
                      else if (item.submenu) setActiveSubmenu(item.submenu);
                    }}
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-lg text-blue-500">{item.icon}</span>
                      <span>{item.label}</span>
                    </div>
                    {item.submenu && (
                      <span className="text-gray-400">
                        <FaChevronLeft size={14} />
                      </span>
                    )}
                  </button>
                </div>
              ))}
            </nav>

            {/* القوائم الفرعية */}
            <AnimatePresence>
              {activeSubmenu && (
                <motion.div
                  initial={{ x: "100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "100%" }}
                  transition={{ type: "tween", duration: 0.3 }}
                  className="absolute top-0 left-0 w-full h-full bg-white z-50"
                >
                  {/* زر الرجوع */}
                  <button
                    className="absolute top-4 left-4 p-2 text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                    onClick={() => setActiveSubmenu(null)}
                    aria-label="رجوع"
                  >
                    <FaChevronLeft size={20} />
                  </button>

                  {/* محتوى القائمة الفرعية */}
                  <div className="mt-16 px-4 overflow-y-auto h-full pb-6">
                    <h3 className="font-bold text-xl mb-6 px-2 text-blue-600">
                      {getSubmenuTitle(activeSubmenu)}
                    </h3>

                    <div className="flex flex-col gap-1">
                      {getSubmenuItems(activeSubmenu).map((item, i) => (
                        <button
                          key={i}
                          className={`flex items-center justify-between py-3 px-4 rounded-lg text-right transition-colors duration-200 ${
                            item.path && location.pathname === item.path
                              ? "bg-blue-100 text-blue-700"
                              : "hover:bg-gray-50 text-gray-700"
                          }`}
                          onClick={() => item.path && handleNavigate(item.path)}
                        >
                          <span className="font-medium">{item.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

// دالة للحصول على عنوان القائمة الفرعية
function getSubmenuTitle(key: string): string {
  const titles: Record<string, string> = {
    settings: "الإعدادات الأساسية",
    operations: "العمليات",
    sales: "تقارير المبيعات",
    purchases: "تقارير المشتريات",
    people: "ادارة الأفراد",
    stores: "المخازن",
  };
  return titles[key] || "";
}

// دالة للحصول على عناصر القائمة الفرعية
function getSubmenuItems(key: string): Array<{ label: string; path?: string }> {
  const submenus: Record<string, Array<{ label: string; path?: string }>> = {
    settings: [
      { label: "ادارة الفروع", path: "/business/branches" },
      { label: "اداره طرق الدفع", path: "/business/payment-methods" },
      { label: "الاعدادات العامة", path: "/settings" },
      { label: "النظام", path: "/system" },
      { label: "النسخ الاحطياطي", path: "/backup" },
      { label: "الاسئله الشائعه", path: "/help" },
    ],
    operations: [
      { label: "فاتورة مبيعات", path: "/stores/sales" },
      { label: "مرتجع مبيعات", path: "/stores/sales-return" },
      { label: "فاتورة مشتريات", path: "/stores/purchases" },
      { label: "مرتجع مشتريات", path: "/stores/purchases-return" },
    ],
    sales: [
      { label: "تقرير المبيعات اليومية", path: "/reports/daily-sales" },
      { label: "تقرير بارباح الفواتير", path: "/reports/invoice-profits" },
      { label: "تقرير بالفواتير التفضيلي" },
      { label: "تقرير بعروض السعر" },
      { label: "تقرير بعروض السعر تفصيلي" },
      { label: "تحليل المبيعات" },
      { label: "تقرير الأصناف المباعة" },
      { label: "تقرير مبيعات بائع" },
      { label: "كشف حساب عميل" },
    ],
    purchases: [
      { label: "تقرير بفواتير المشتريات" },
      { label: "تقرير بفواتير المشتريات التفضيلي" },
      { label: "تقرير بعروض الشراء" },
      { label: "تقرير بعروض الشراء تفصيلي" },
      { label: "تحليل المشتريات" },
      { label: "تقرير الأصناف المشتراة" },
      { label: "تقرير مشتريات مورد" },
      { label: "كشف حساب مورد" },
    ],
    people: [
      { label: "ادارة الموظفين", path: "/admin/employees" },
      { label: "ادارة العملاء", path: "/customers" },
      { label: "ادارة الموردين", path: "/suppliers" },
      { label: "اداره مديرين الفروع", path: "/admin/admins" },
    ],
    stores: [
      { label: "ادارة المخازن", path: "/stores/manage" },
      { label: "ادارة الاصناف", path: "/stores/item" },
      { label: "المخزون", path: "/stores/stock" },
    ],
  };

  return submenus[key] || [];
}

export default MobileSidebar;