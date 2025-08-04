import React, { useState, useRef, useEffect } from "react";
import { FaStar, FaHome, FaCog, FaExchangeAlt, FaChartBar, FaChevronDown, FaChevronUp, FaChevronRight, FaFileInvoiceDollar, FaUndo, FaFileInvoice, FaUndoAlt, FaWarehouse, FaBoxes, FaCubes, FaUsers, FaUserTie, FaUserFriends, FaUserCheck, FaUserShield, FaBuilding, FaMoneyCheckAlt, FaSlidersH, FaServer, FaCloudUploadAlt, FaQuestionCircle, FaTasks } from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useSidebar } from "../hooks/useSidebar";
import { getSidebarMenus } from "../utils/sidebarMenus";

const Sidebar = () => {
  // حفظ حالة القائمة الجانبية في localStorage
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const saved = localStorage.getItem('sidebarOpen');
    return saved ? JSON.parse(saved) : false;
  });
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [submenuPosition, setSubmenuPosition] = useState({ top: 0, left: 0 });
  const { currentSection } = useSidebar();

  const sidebarRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<{[key: string]: HTMLDivElement | null}>({});

  // حفظ حالة القائمة الجانبية عند تغييرها
  useEffect(() => {
    localStorage.setItem('sidebarOpen', JSON.stringify(sidebarOpen));
  }, [sidebarOpen]);

  const toggleMenu = (menu: string) => {
    setActiveMenu(activeMenu === menu ? null : menu);
  };

  useEffect(() => {
    if (activeMenu && itemRefs.current[activeMenu]) {
      const rect = itemRefs.current[activeMenu]?.getBoundingClientRect();
      if (rect) {
        setSubmenuPosition({
          top: rect.top,
          left: sidebarOpen ? rect.right : rect.right + (56 - 19)
        });
      }
    }
  }, [activeMenu, sidebarOpen]);

  const navigate = useNavigate();
  const location = useLocation();

  // الحصول على قائمة الأصناف بناءً على القسم الحالي
  const menuItems = getSidebarMenus(currentSection);

  return (
    <div className="relative hidden md:flex" ref={sidebarRef}>
      <motion.aside
        initial={{ width: 224 }}
        animate={{ width: sidebarOpen ? 224 : 76 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={`bg-white shadow-md flex flex-col scrollbar-hide`}
        style={{ height: "89vh", overflowY: "auto", position: "sticky", top: "80px", zIndex: 20 }}
      >
        <nav className="flex-1 py-6 px-2 flex flex-col">
          {menuItems.map((item, index) => (
            <React.Fragment key={index}>
              <SidebarItem 
                icon={item.icon} 
                label={item.label} 
                open={sidebarOpen} 
                className="border-b border-gray-200 last:border-b-0" 
                active={item.path ? location.pathname === item.path : false}
                hasSubmenu={item.hasSubmenu}
                isOpen={activeMenu === item.label}
                onClick={() => {
                  if (item.hasSubmenu) {
                    toggleMenu(item.label);
                  } else if (item.path) {
                    setActiveMenu(null);
                    navigate(item.path);
                  }
                }}
                ref={(el) => itemRefs.current[item.label] = el}
              />

              {/* عرض القائمة الفرعية */}
              {item.hasSubmenu && activeMenu === item.label && (
                <>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="fixed inset-0 z-20 bg-black bg-opacity-10"
                    onClick={() => setActiveMenu(null)}
                  />
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="fixed bg-white shadow-[0_0_10px_0_rgba(0,0,0,0.1)] rounded-md pt-0 pb-2 z-30 min-w-[260px] border border-gray-200 scrollbar-hide"
                    style={{
                      top: `${submenuPosition.top}px`,
                      right: sidebarOpen ? 228 : 70,
                      maxHeight: '400px',
                      overflowY: 'auto',
                      overflowX: 'hidden',
                    }}
                  >
                    <div className="sticky top-0 bg-white z-40 flex items-center gap-2 px-4 py-2 text-blue-600 font-bold text-base border-b border-gray-100 select-none shadow-sm">
                      <motion.div
                        animate={{ rotate: activeMenu === item.label ? 360 : 0 }}
                        transition={{ duration: 0.5 }}
                      >
                        {item.icon}
                      </motion.div>
                      {item.label}
                    </div>
                    {item.submenu?.map((subItem, subIndex) => (
                      <SubmenuItem 
                        key={subIndex}
                        label={subItem.label}
                        icon={subItem.icon}
                        isLast={subIndex === (item.submenu?.length || 0) - 1}
                        active={subItem.path && location.pathname === subItem.path}
                        onClick={subItem.path ? (() => { setActiveMenu(null); navigate(subItem.path); }) : undefined}
                      />
                    ))}
                  </motion.div>
                </>
              )}
            </React.Fragment>
          ))}
        </nav>

        <motion.button
          whileTap={{ scale: 0.95 }}
          className="flex items-center justify-center py-3 border-t hover:bg-gray-100 transition-colors"
          onClick={() => setSidebarOpen((prev) => !prev)}
          aria-label={sidebarOpen ? "إغلاق القائمة" : "فتح القائمة"}
        >
          {sidebarOpen ? <FaChevronDown /> : <FaChevronUp />}
        </motion.button>
      </motion.aside>
    </div>
  );
};

const SidebarItem = React.forwardRef(({ 
  icon, 
  label, 
  open, 
  active = false, 
  className = "", 
  hasSubmenu = false,
  isOpen = false,
  onClick 
}: { 
  icon: React.ReactNode; 
  label: string; 
  open: boolean; 
  active?: boolean; 
  className?: string;
  hasSubmenu?: boolean;
  isOpen?: boolean;
  onClick?: () => void;
}, ref: React.Ref<HTMLDivElement>) => (
  <motion.div
    ref={ref}
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    className={
      `flex items-center justify-between gap-3 px-3 py-2 cursor-pointer transition-colors border-r-4 ${className}
      ${active ? 'border-blue-600 bg-blue-50' : 'border-transparent'}
      ${active && open ? 'bg-[#f6f7f9]' : ''}
      hover:border-blue-600 group hover:bg-[#f6f7f9]`
    }
    onClick={onClick}
  >
    <div className="flex items-center gap-3">
      <motion.span 
        className={`text-2xl transition-colors ${active ? 'text-blue-600' : 'text-gray-500'} group-hover:text-blue-600`}
        whileHover={{ scale: 1.1 }}
      >
        {icon}
      </motion.span>
      {open && (
        <motion.span 
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className={`text-base font-medium transition-colors ${active ? 'text-blue-600' : 'text-gray-800'} group-hover:text-blue-600`}
        >
          {label}
        </motion.span>
      )}
    </div>
    {hasSubmenu && open && (
      <motion.div
        animate={{ rotate: isOpen ? 90 : 0 }}
        transition={{ duration: 0.2 }}
      >
        <FaChevronRight className="text-xs" />
      </motion.div>
    )}
  </motion.div>
));

const SubmenuItem = ({ label, icon, isLast, onClick, active }: { label: string; icon?: React.ReactNode; isLast: boolean; onClick?: () => void; active?: boolean }) => (
  <motion.div
    whileHover={{ x: 5 }}
    whileTap={{ scale: 0.98 }}
    className={`px-4 py-2 flex items-center gap-2 cursor-pointer transition-colors ${
      active ? 'bg-blue-50 text-blue-700 font-bold' : ''
    } ${isLast ? '' : 'border-b border-gray-100'} hover:bg-gray-100`}
    onClick={onClick}
  >
    {icon && <span className={`text-lg ${active ? 'text-blue-600' : ''}`}>{icon}</span>}
    <motion.span 
      className={`text-sm ${active ? 'text-blue-700 font-bold' : 'text-gray-700'} hover:text-blue-600`}
      whileHover={{ scale: 1.02 }}
    >
      {label}
    </motion.span>
  </motion.div>
);

export default Sidebar;