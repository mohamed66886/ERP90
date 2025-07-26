import React, { useState, useRef, useEffect } from "react";
import { FaStar, FaHome, FaCog, FaExchangeAlt, FaChartBar, FaChevronDown, FaChevronUp, FaChevronRight, FaFileInvoiceDollar, FaUndo, FaFileInvoice, FaUndoAlt, FaWarehouse, FaBoxes, FaCubes, FaUsers, FaUserTie, FaUserFriends, FaUserCheck, FaUserShield, FaBuilding, FaMoneyCheckAlt, FaSlidersH, FaServer, FaCloudUploadAlt, FaQuestionCircle } from "react-icons/fa";
  // قائمة الإعدادات الأساسية مع الأيقونات
  const settingsMenu = [
    { label: "ادارة الفروع", icon: <FaBuilding className="text-blue-500" />, path: "/business/branches" },
    { label: "اداره طرق الدفع", icon: <FaMoneyCheckAlt className="text-green-500" />, path: "/business/payment-methods" },
    { label: "الاعدادات العامة", icon: <FaSlidersH className="text-purple-500" />, path: "/settings" },
    { label: "النظام", icon: <FaServer className="text-orange-500" />, path: "/system" },
    { label: "النسخ الاحطياطي", icon: <FaCloudUploadAlt className="text-teal-500" />, path: "/backup" },
    { label: "الاسئله الشائعه", icon: <FaQuestionCircle className="text-pink-500" />, path: "/help" }
  ];
  // قائمة ادارة الأفراد مع الأيقونات
  const peopleMenu = [
    { label: "ادارة الموظفين", icon: <FaUserTie className="text-blue-500" />, path: "/admin/employees" },
    { label: "ادارة العملاء", icon: <FaUserFriends className="text-green-500" />, path: "/customers" },
    { label: "ادارة الموردين", icon: <FaUserCheck className="text-purple-500" />, path: "/suppliers" },
    { label: "اداره مديرين الفروع", icon: <FaUserShield className="text-orange-500" />, path: "/admin/admins" }
  ];
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const Sidebar = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [submenuPosition, setSubmenuPosition] = useState({ top: 0, left: 0 });

  // عناصر القائمة الفرعية للعمليات مع الأيقونات والمسارات
  const operationsMenu = [
    { label: "فاتورة مبيعات", icon: <FaFileInvoiceDollar className="text-blue-500" />, path: "/stores/sales" },
    { label: "مرتجع مبيعات", icon: <FaUndo className="text-green-500" />, path: "/stores/sales-return" },
    { label: "فاتورة مشتريات", icon: <FaFileInvoice className="text-purple-500" />, path: "/stores/purchases" },
    { label: "مرتجع مشتريات", icon: <FaUndoAlt className="text-red-500" />, path: "/stores/purchases-return" }
  ];
  const sidebarRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<{[key: string]: HTMLDivElement | null}>({});

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

  const salesReports = [
        { label: "تقرير الفواتير ", icon: <FaFileInvoice className="text-orange-500" />, path: "/reports/invoice" },
    { label: "تقرير المبيعات اليومية", icon: <FaChartBar className="text-blue-500" />, path: "/reports/daily-sales" },
    { label: "تقرير بارباح الفواتير", icon: <FaFileInvoiceDollar className="text-green-500" />, path: "/reports/invoice-profits" },
    { label: "تقرير بالفواتير التفضيلي", icon: <FaFileInvoiceDollar className="text-purple-500" />, path: "/reports/invoice-preferred" },
    // { label: "تقرير بعروض السعر", icon: <FaFileInvoice className="text-orange-500" />, path: "/reports/invoice" },
    // { label: "تقرير بعروض السعر تفصيلي", icon: <FaFileInvoice className="text-pink-500" /> },
    // { label: "تحليل المبيعات", icon: <FaChartBar className="text-teal-500" /> },
    // { label: "تقرير الأصناف المباعة", icon: <FaBoxes className="text-yellow-500" /> },
    // { label: "تقرير مبيعات بائع", icon: <FaUserTie className="text-blue-400" /> },
    // { label: "كشف حساب عميل", icon: <FaUsers className="text-gray-500" /> }
  ];


  const purchasesReports = [
    "تقرير بفواتير المشتريات",
    "تقرير بفواتير المشتريات التفضيلي",
    "تقرير بعروض الشراء",
    "تقرير بعروض الشراء تفصيلي",
    "تحليل المشتريات",
    "تقرير الأصناف المشتراة",
    "تقرير مشتريات مورد",
    "كشف حساب مورد"
  ];

  // المخازن submenu items
  const storesMenu = [
    { label: "ادارة المخازن", icon: <FaWarehouse className="text-blue-500" />, path: "/stores/manage" },
    { label: "ادارة الاصناف", icon: <FaBoxes className="text-green-500" />, path: "/stores/item" },
    { label: "المخزون", icon: <FaCubes className="text-purple-500" />, path: "/stores/stock" }
  ];

  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="flex relative hidden md:flex" ref={sidebarRef}>
      <motion.aside
        initial={{ width: 224 }}
        animate={{ width: sidebarOpen ? 224 : 76 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={`bg-white shadow-md flex flex-col scrollbar-hide`}
        style={{ height: "89vh", overflowY: "auto", position: "sticky", top: "80px", zIndex: 20 }}
      >
        <nav className="flex-1 py-6 px-2 flex flex-col">
          <SidebarItem 
            icon={<FaHome />} 
            label="الصفحة الرئيسية" 
            open={sidebarOpen} 
            className="border-b border-gray-200 last:border-b-0" 
            active={location.pathname === '/'}
            onClick={() => { setActiveMenu(null); navigate('/'); }}
            ref={(el) => itemRefs.current['home'] = el}
          />
          <SidebarItem 
            icon={<FaStar />} 
            label="المفضلة" 
            open={sidebarOpen} 
            className="border-b border-gray-200 last:border-b-0" 
            onClick={() => toggleMenu('favorites')}
            ref={(el) => itemRefs.current['favorites'] = el}
          />
          
          <SidebarItem 
            icon={<FaCog />} 
            label="الإعدادات الأساسية" 
            open={sidebarOpen} 
            className="border-b border-gray-200 last:border-b-0" 
            hasSubmenu
            isOpen={activeMenu === 'settings'}
            onClick={() => toggleMenu('settings')}
            ref={(el) => itemRefs.current['settings'] = el}
          />
        {activeMenu === 'settings' && (
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
                maxHeight: '230px',
                overflowY: 'auto',
                overflowX: 'hidden',
              }}
            >
              <div className="sticky top-0 bg-white z-40 flex items-center gap-2 px-4 py-2 text-blue-600 font-bold text-base border-b border-gray-100 select-none shadow-sm">
                <motion.div
                  animate={{ rotate: activeMenu === 'settings' ? 360 : 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <FaCog className="text-blue-600" />
                </motion.div>
                الإعدادات الأساسية
              </div>
              {settingsMenu.map((item, index) => (
                <SubmenuItem 
                  key={index}
                  label={item.label}
                  icon={item.icon}
                  isLast={index === settingsMenu.length - 1}
                  active={location.pathname === item.path}
                  onClick={() => {
                    setActiveMenu(null);
                    navigate(item.path);
                  }}
                />
              ))}
            </motion.div>
          </>
        )}
          
          <SidebarItem 
            icon={<FaExchangeAlt />} 
            label="العمليات" 
            open={sidebarOpen} 
            className="border-b border-gray-200 last:border-b-0" 
            hasSubmenu
            isOpen={activeMenu === 'operations'}
            onClick={() => toggleMenu('operations')}
            ref={(el) => itemRefs.current['operations'] = el}
          />
          
          <SidebarItem 
            icon={<FaChartBar />} 
            label="تقارير المبيعات" 
            open={sidebarOpen} 
            className="border-b border-gray-200 last:border-b-0"
            hasSubmenu
            isOpen={activeMenu === 'sales'}
            onClick={() => toggleMenu('sales')}
            ref={(el) => itemRefs.current['sales'] = el}
          />
         <SidebarItem 
           icon={<FaFileInvoice />} 
           label="تقارير المشتريات" 
           open={sidebarOpen} 
           className="border-b border-gray-200 last:border-b-0"
           hasSubmenu
           isOpen={activeMenu === 'purchases'}
           onClick={() => toggleMenu('purchases')}
           ref={(el) => itemRefs.current['purchases'] = el}
         />
        <SidebarItem 
          icon={<FaUsers />} 
          label="ادارة الأفراد" 
          open={sidebarOpen} 
          className="border-b border-gray-200 last:border-b-0"
          hasSubmenu
          isOpen={activeMenu === 'people'}
          onClick={() => toggleMenu('people')}
          ref={(el) => itemRefs.current['people'] = el}
        />
          <SidebarItem 
            icon={<FaWarehouse />} 
            label="المخازن" 
            open={sidebarOpen} 
            className="border-b border-gray-200 last:border-b-0"
            hasSubmenu
            isOpen={activeMenu === 'stores'}
            onClick={() => toggleMenu('stores')}
            ref={(el) => itemRefs.current['stores'] = el}
          />
        {activeMenu === 'people' && (
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
                maxHeight: '230px',
                overflowY: 'auto',
                overflowX: 'hidden',
              }}
            >
              <div className="sticky top-0 bg-white z-40 flex items-center gap-2 px-4 py-2 text-blue-600 font-bold text-base border-b border-gray-100 select-none shadow-sm">
                <motion.div
                  animate={{ rotate: activeMenu === 'people' ? 360 : 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <FaUsers className="text-blue-600" />
                </motion.div>
                ادارة الأفراد
              </div>
              {peopleMenu.map((item, index) => (
                <SubmenuItem 
                  key={index}
                  label={item.label}
                  icon={item.icon}
                  isLast={index === peopleMenu.length - 1}
                  active={location.pathname === item.path}
                  onClick={() => {
                    setActiveMenu(null);
                    navigate(item.path);
                  }}
                />
              ))}
            </motion.div>
          </>
        )}
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

      {/* القوائم الفرعية المنبثقة */}
      <AnimatePresence>
        {activeMenu === 'sales' && (
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
                maxHeight: '230px',
                overflowY: 'auto',
                overflowX: 'hidden',
              }}
            >
              <div className="sticky top-0 bg-white z-40 flex items-center gap-2 px-4 py-2 text-blue-600 font-bold text-base border-b border-gray-100 select-none shadow-sm">
                <motion.div
                  animate={{ rotate: activeMenu === 'sales' ? 360 : 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <FaChartBar className="text-blue-600" />
                </motion.div>
                تقارير المبيعات
              </div>
              {salesReports.map((report, index) => (
                <SubmenuItem 
                  key={index}
                  label={report.label}
                  icon={report.icon}
                  isLast={index === salesReports.length - 1}
                  active={report.path && location.pathname === report.path}
                  onClick={report.path ? (() => { setActiveMenu(null); navigate(report.path); }) : undefined}
                />
              ))}
            </motion.div>
          </>
        )}
       {activeMenu === 'purchases' && (
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
               maxHeight: '230px',
               overflowY: 'auto',
               overflowX: 'hidden',
             }}
           >
             <div className="sticky top-0 bg-white z-40 flex items-center gap-2 px-4 py-2 font-bold text-base border-b border-gray-100 select-none shadow-sm">
               <motion.div
                 animate={{ rotate: activeMenu === 'purchases' ? 360 : 0 }}
                 transition={{ duration: 0.5 }}
               >
                 <FaFileInvoice />
               </motion.div>
               تقارير المشتريات
             </div>
             {purchasesReports.map((report, index) => (
               <SubmenuItem 
                 key={index}
                 label={report}
                 isLast={index === purchasesReports.length - 1}
               />
             ))}
           </motion.div>
         </>
       )}
        {activeMenu === 'stores' && (
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
                maxHeight: '230px',
                overflowY: 'auto',
                overflowX: 'hidden',
              }}
            >
              <div className="sticky top-0 bg-white z-40 flex items-center gap-2 px-4 py-2 text-blue-600 font-bold text-base border-b border-gray-100 select-none shadow-sm">
                <motion.div
                  animate={{ rotate: activeMenu === 'stores' ? 360 : 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <FaWarehouse className="text-blue-600" />
                </motion.div>
                المخازن
              </div>
              {storesMenu.map((item, index) => (
                <SubmenuItem 
                  key={index}
                  label={item.label}
                  icon={item.icon}
                  isLast={index === storesMenu.length - 1}
                  active={location.pathname === item.path}
                  onClick={() => {
                    setActiveMenu(null);
                    navigate(item.path);
                  }}
                />
              ))}
            </motion.div>
          </>
        )}
        {activeMenu === 'operations' && (
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
                maxHeight: '230px',
                overflowY: 'auto',
                overflowX: 'hidden',
              }}
            >
              <div className="sticky top-0 bg-white z-40 flex items-center gap-2 px-4 py-2 text-blue-600 font-bold text-base border-b border-gray-100 select-none shadow-sm">
                <motion.div
                  animate={{ rotate: activeMenu === 'operations' ? 360 : 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <FaExchangeAlt className="text-blue-600" />
                </motion.div>
                العمليات
              </div>
              {operationsMenu.map((item, index) => (
                <SubmenuItem 
                  key={index}
                  label={item.label}
                  icon={item.icon}
                  isLast={index === operationsMenu.length - 1}
                  active={location.pathname === item.path}
                  onClick={() => {
                    setActiveMenu(null);
                    navigate(item.path);
                  }}
                />
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
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