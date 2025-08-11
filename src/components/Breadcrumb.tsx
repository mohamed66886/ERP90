import React from "react";
import { Link } from "react-router-dom";
import { 
  HomeFilled, 
  ShopFilled, 
  FileTextFilled, 
  ApartmentOutlined, 
  RollbackOutlined, 
  CreditCardFilled, 
  CarFilled,
  MoneyCollectOutlined
} from "@ant-design/icons";
import { motion } from "framer-motion";

interface BreadcrumbItem {
  label: string;
  to?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
  const getIcon = (label: string) => {
    const iconStyle = "text-blue-400 mr-2 rtl:ml-2";
    const iconMap: Record<string, JSX.Element> = {
      "الرئيسية": <HomeFilled className={`text-white ${iconStyle}`} />, 
      "المخازن": <ShopFilled className={iconStyle} />, 
      "المخزون": <FileTextFilled className={iconStyle} />, 
      "ادارة الفروع": <ApartmentOutlined className={iconStyle} />, 
      "فاتورة مبيعات": <ShopFilled className={iconStyle} />, 
      "مرتجع مبيعات": <RollbackOutlined className={iconStyle} />, 
      "ادارة طرق الدفع": <CreditCardFilled className={iconStyle} />, 
      "تقارير المبيعات اليوميه": <FileTextFilled className={iconStyle} />, 
      "تقرير بارباح الفواتير": <FileTextFilled className={iconStyle} />, 
      "رجوع": <RollbackOutlined className={iconStyle} />, 
      "الادارة الماليه": <FileTextFilled className={iconStyle} />, 
      "دليل الحسابات الشجري": <ApartmentOutlined className={iconStyle} />, 
      "تصنيف الحسابات": <ApartmentOutlined className={iconStyle} />, 
      "السنوات المالية": <FileTextFilled className={iconStyle} />, 
      "إضافة حساب جديد": <CreditCardFilled className={iconStyle} />, 
      "تعديل الحساب": <CreditCardFilled className={iconStyle} />, 
      "الصناديق النقدية": <CarFilled className={iconStyle} />, 
      "البنوك": <CreditCardFilled className={iconStyle} />,
      "سند قبض": <MoneyCollectOutlined className={iconStyle} />
    };
    return iconMap[label] || null;
  };

  // For mobile, we'll show a simplified version with only the current and previous items
  const visibleItems = window.innerWidth < 768 
    ? items.slice(Math.max(items.length - 2, 0))
    : items;

  return (
    <div className="flex items-center bg-white p-3 rounded-lg shadow-sm mb-4 overflow-x-auto no-scrollbar">
      {/* Show back indicator on mobile if we're hiding items */}
      {window.innerWidth < 768 && items.length > 2 && (
        <motion.div 
          whileTap={{ scale: 0.95 }}
          className="mr-2 rtl:ml-2 text-gray-500"
        >
          <span className="text-sm">...</span>
        </motion.div>
      )}

      {visibleItems.map((item, idx) => (
        <React.Fragment key={idx}>
          {item.to ? (
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.95 }}
              className={`flex items-center ${
                idx === 0 && visibleItems.length === items.length 
                  ? "bg-blue-600 px-3 py-1.5 rounded-full" 
                  : "px-2 py-1"
              }`}
            >
              <Link
                to={item.to}
                className={`flex items-center ${
                  idx === 0 && visibleItems.length === items.length 
                    ? "text-white" 
                    : "text-gray-600 hover:text-blue-600"
                }`}
              >
                {getIcon(item.label)}
                <span className="font-medium text-sm sm:text-base">
                  {item.label}
                </span>
              </Link>
            </motion.div>
          ) : (
            <div className="flex items-center px-2 py-1">
              {getIcon(item.label)}
              <span className="font-bold text-blue-700 text-sm sm:text-base">
                {item.label}
              </span>
            </div>
          )}
          {idx < visibleItems.length - 1 && (
            <div className="mx-1 sm:mx-2 text-gray-300">/</div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default Breadcrumb;

// Add this to your global CSS
// .no-scrollbar::-webkit-scrollbar {
//   display: none;
// }
// .no-scrollbar {
//   -ms-overflow-style: none;
//   scrollbar-width: none;
// }