import React from "react";
import { Link } from "react-router-dom";
import { HomeFilled, ShopFilled, FileTextFilled, UserOutlined, UserAddOutlined, RollbackOutlined } from "@ant-design/icons";
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
    switch (label) {
      case "الرئيسية":
        return <HomeFilled className="text-white mr-2 rtl:ml-2" />;
      case "المخازن":
        return <ShopFilled className="text-blue-400 mr-2 rtl:ml-2" />;
      case "المخزون":
        return <FileTextFilled className="text-blue-400 mr-2 rtl:ml-2" />;
        case "فاتورة مبيعات":
        return <ShopFilled className="text-blue-400 mr-2 rtl:ml-2" />;
      case "مرتجع مبيعات":
        return <RollbackOutlined className="text-blue-400 mr-2 rtl:ml-2" />;
      default:
        return null;
    }
  };

  return (
    <div className="flex items-center bg-white p-4 rounded-lg shadow-sm mb-6">
      {items.map((item, idx) => (
        <React.Fragment key={idx}>
          {item.to ? (
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className={`flex items-center ${idx === 0 ? "bg-blue-600 px-4 py-2 rounded-full" : "px-3 py-1"}`}
            >
              <Link
                to={item.to}
                className={`flex items-center ${idx === 0 ? "text-white" : "text-gray-600 hover:text-blue-600"}`}
              >
                {getIcon(item.label)}
                <span className="font-medium">{item.label}</span>
              </Link>
            </motion.div>
          ) : (
            <div className="flex items-center px-3 py-1">
              {getIcon(item.label)}
              <span className="font-bold text-blue-700">{item.label}</span>
            </div>
          )}
          {idx < items.length - 1 && (
            <div className="mx-2 text-gray-300">/</div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default Breadcrumb;