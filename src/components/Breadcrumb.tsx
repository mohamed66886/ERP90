import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { 
  HomeFilled, 
  ShopFilled, 
  FileTextFilled, 
  ApartmentOutlined, 
  RollbackOutlined, 
  CreditCardFilled, 
  CarFilled,
  MoneyCollectOutlined,
  BankOutlined,
  CalculatorOutlined,
  FolderOutlined,
  DashboardOutlined,
  SettingOutlined
} from "@ant-design/icons";
import { motion } from "framer-motion";

interface BreadcrumbItem {
  label: string;
  to?: string;
  icon?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
  separator?: string;
  maxVisibleItems?: number;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ 
  items, 
  className = "", 
  separator = "/", 
  maxVisibleItems = 3 
}) => {
  const getIcon = useMemo(() => (label: string, customIcon?: string) => {
    const iconStyle = "text-blue-500 mr-2 rtl:ml-2 text-sm";
    
    // إذا تم تمرير أيقونة مخصصة
    if (customIcon) {
      return <span className={iconStyle}>{customIcon}</span>;
    }
    
    const iconMap: Record<string, JSX.Element> = {
      "الرئيسية": <HomeFilled className={`text-white ${iconStyle}`} />, 
      "الصفحة الرئيسية": <DashboardOutlined className={iconStyle} />,
      "المخازن": <ShopFilled className={iconStyle} />, 
      "المخزون": <FolderOutlined className={iconStyle} />, 
      "ادارة الفروع": <ApartmentOutlined className={iconStyle} />, 
      "فاتورة مبيعات": <FileTextFilled className={iconStyle} />, 
      "مرتجع مبيعات": <RollbackOutlined className={iconStyle} />, 
      "ادارة طرق الدفع": <CreditCardFilled className={iconStyle} />, 
      "تقارير المبيعات اليوميه": <CalculatorOutlined className={iconStyle} />, 
      "تقرير بارباح الفواتير": <CalculatorOutlined className={iconStyle} />, 
      "رجوع": <RollbackOutlined className={iconStyle} />, 
      "الادارة الماليه": <BankOutlined className={iconStyle} />, 
      "دليل الحسابات الشجري": <ApartmentOutlined className={iconStyle} />, 
      "تصنيف الحسابات": <SettingOutlined className={iconStyle} />, 
      "السنوات المالية": <CalculatorOutlined className={iconStyle} />, 
      "إضافة حساب جديد": <CreditCardFilled className={iconStyle} />, 
      "تعديل الحساب": <SettingOutlined className={iconStyle} />, 
      "الصناديق النقدية": <CarFilled className={iconStyle} />, 
      "البنوك": <BankOutlined className={iconStyle} />,
      "سند قبض": <MoneyCollectOutlined className={iconStyle} />
    };
    return iconMap[label] || <FolderOutlined className={iconStyle} />;
  }, []);

  // تحسين عرض العناصر للشاشات الصغيرة
  const visibleItems = useMemo(() => {
    if (typeof window === 'undefined') return items;
    
    const isMobile = window.innerWidth < 768;
    if (!isMobile || items.length <= maxVisibleItems) {
      return items;
    }
    
    // عرض العنصر الأول والعناصر الأخيرة
    return [
      items[0],
      ...items.slice(Math.max(items.length - (maxVisibleItems - 1), 1))
    ];
  }, [items, maxVisibleItems]);

  const hasHiddenItems = items.length > visibleItems.length;

  return (
    <nav 
      className={`
        flex items-center 
        bg-gradient-to-r from-white to-gray-50 
        border border-gray-200 
        p-4 rounded-xl 
        shadow-md shadow-gray-100/30
        mb-6 
        overflow-x-auto 
        scrollbar-hide
        backdrop-blur-sm
        ${className}
      `}
      aria-label="مسار التنقل"
    >
      {/* مؤشر العناصر المخفية للشاشات الصغيرة */}
      {hasHiddenItems && (
        <motion.div 
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center mr-3 rtl:ml-3"
        >
          <div className="flex space-x-1 rtl:space-x-reverse">
            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
          </div>
        </motion.div>
      )}

      {visibleItems.map((item, idx) => (
        <React.Fragment key={`${item.label}-${idx}`}>
          {item.to ? (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ 
                scale: 1.02,
                transition: { duration: 0.2 }
              }}
              whileTap={{ scale: 0.98 }}
              className={`
                flex items-center 
                transition-all duration-300 ease-in-out
                ${idx === 0 
                  ? "bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-2.5 rounded-lg shadow-sm" 
                  : "px-3 py-2 rounded-md hover:bg-blue-50"
                }
              `}
            >
              <Link
                to={item.to}
                className={`
                  flex items-center 
                  transition-colors duration-200
                  ${idx === 0 
                    ? "text-white" 
                    : "text-gray-700 hover:text-blue-600"
                  }
                `}
                aria-current={idx === visibleItems.length - 1 ? "page" : undefined}
              >
                {getIcon(item.label, item.icon)}
                <span className="font-semibold text-sm lg:text-base whitespace-nowrap">
                  {item.label}
                </span>
              </Link>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="flex items-center px-3 py-2 rounded-md bg-blue-50 border border-blue-100"
            >
              {getIcon(item.label, item.icon)}
              <span className="font-bold text-blue-800 text-sm lg:text-base whitespace-nowrap">
                {item.label}
              </span>
            </motion.div>
          )}
          
          {idx < visibleItems.length - 1 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: idx * 0.1 + 0.05 }}
              className="mx-2 lg:mx-3 text-gray-400 font-medium select-none"
              aria-hidden="true"
            >
              {separator}
            </motion.div>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumb;

/* إضافة الأنماط المطلوبة إلى ملف CSS العام أو index.css */
/*
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
*/