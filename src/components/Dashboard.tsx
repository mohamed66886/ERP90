import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { motion, useAnimation } from 'framer-motion';
import { 
  Users, FileText, ShoppingCart, Settings,
  CreditCard, Package, Truck, ArrowRight,
  Building2
} from 'lucide-react';
import { useSidebar } from '../hooks/useSidebar';
import { SectionType } from '../contexts/SidebarContext';
import Breadcrumb from './Breadcrumb';

const ERP90Dashboard = () => {
  const navigate = useNavigate();
  const { setCurrentSection } = useSidebar();
  const controls = useAnimation();

  // ربط الروابط بأقسام القائمة الجانبية
  const routeToSectionMap: Record<string, SectionType> = {
    '/management/financial': 'financial',
    '/management/hr': 'hr',
    '/management/warehouse': 'warehouse',
    '/management/projects': 'projects',
    '/management/sales': 'sales',
    '/management/purchase': 'purchase',
    '/management/contracts': 'contracts',
    '/management/equipment': 'equipment',
  };

  const handleQuickActionClick = (route: string) => {
    const section = routeToSectionMap[route] || 'default';
    setCurrentSection(section);
    navigate(route);
  };

  const quickActions = [
    { title: "الإدارة المالية", icon: <CreditCard className="w-4 h-4 sm:w-5 sm:h-5" />, color: "bg-gradient-to-br from-blue-500 to-blue-600", hoverColor: "hover:from-blue-600 hover:to-blue-700", bgColor: "bg-blue-50", borderColor: "border-blue-200", description: "إدارة الحسابات والميزانيات", route: "/management/financial" },
    { title: "الموارد البشرية", icon: <Users className="w-4 h-4 sm:w-5 sm:h-5" />, color: "bg-gradient-to-br from-emerald-500 to-emerald-600", hoverColor: "hover:from-emerald-600 hover:to-emerald-700", bgColor: "bg-emerald-50", borderColor: "border-emerald-200", description: "إدارة الموظفين والرواتب", route: "/management/hr" },
    { title: "إدارة المخازن", icon: <Package className="w-4 h-4 sm:w-5 sm:h-5" />, color: "bg-gradient-to-br from-orange-500 to-orange-600", hoverColor: "hover:from-orange-600 hover:to-orange-700", bgColor: "bg-orange-50", borderColor: "border-orange-200", description: "إدارة المخزون والمستودعات", route: "/management/warehouse" },
    { title: "إدارة المشاريع", icon: <FileText className="w-4 h-4 sm:w-5 sm:h-5" />, color: "bg-gradient-to-br from-purple-500 to-purple-600", hoverColor: "hover:from-purple-600 hover:to-purple-700", bgColor: "bg-purple-50", borderColor: "border-purple-200", description: "متابعة وإدارة المشاريع", route: "/management/projects" },
    { title: "إدارة المبيعات والعملاء", icon: <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />, color: "bg-gradient-to-br from-rose-500 to-rose-600", hoverColor: "hover:from-rose-600 hover:to-rose-700", bgColor: "bg-rose-50", borderColor: "border-rose-200", description: "إدارة العملاء والمبيعات", route: "/management/sales" },
    { title: "إدارة المشتريات والموردين", icon: <Truck className="w-4 h-4 sm:w-5 sm:h-5" />, color: "bg-gradient-to-br from-teal-500 to-teal-600", hoverColor: "hover:from-teal-600 hover:to-teal-700", bgColor: "bg-teal-50", borderColor: "border-teal-200", description: "إدارة الموردين والمشتريات", route: "/management/purchase" },
    { title: "إدارة المناقصات والعقود", icon: <FileText className="w-4 h-4 sm:w-5 sm:h-5" />, color: "bg-gradient-to-br from-indigo-500 to-indigo-600", hoverColor: "hover:from-indigo-600 hover:to-indigo-700", bgColor: "bg-indigo-50", borderColor: "border-indigo-200", description: "إدارة العقود والمناقصات", route: "/management/contracts" },
    { title: "إدارة المعدات والوحدات الإنتاجية", icon: <Settings className="w-4 h-4 sm:w-5 sm:h-5" />, color: "bg-gradient-to-br from-amber-500 to-amber-600", hoverColor: "hover:from-amber-600 hover:to-amber-700", bgColor: "bg-amber-50", borderColor: "border-amber-200", description: "إدارة المعدات والإنتاج", route: "/management/equipment" }
  ];

  useEffect(() => {
    controls.start({
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    });
    AOS.init({ duration: 700, once: true });
    
    // إعادة تعيين القائمة الجانبية للوضع الافتراضي في الصفحة الرئيسية
    setCurrentSection('default');
  }, [controls, setCurrentSection]);

  return (
    <div className="min-h-screen bg-gray-50 rtl" dir="rtl">
      {/* Main Content */}
      <main className="p-3 sm:p-4 md:p-6 lg:p-8 max-w-8xl mx-auto">
        {/* Page Title */}

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={controls}
          className="mb-6 md:mb-8"
          data-aos="fade-up"
        >
                      <div className="p-3 sm:p-4 font-['Tajawal'] bg-white mb-4 rounded-lg shadow-[0_0_10px_rgba(0,0,0,0.1)] relative overflow-hidden">
        <div className="flex items-center">
          <Building2 className="h-5 w-5 sm:h-8 sm:w-8 text-blue-600 ml-1 sm:ml-3" />
          <h1 className="text-base sm:text-2xl font-bold text-gray-800">مرحبًا بك في ERP90</h1>
        </div>
        <p className="text-xs sm:text-base text-gray-600 mt-2">اختر الخدمة التي تريد الوصول إليها</p>
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-purple-500"></div>
      </div>
 
        </motion.div>
                               <Breadcrumb
        items={[
          { label: "الرئيسية", to: "/" },
        ]}
      />
        {/* Quick Actions */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={controls}
          transition={{ delay: 0.3 }}
          className="mb-6 md:mb-8"
          data-aos="fade-up"
        >
          <div className="bg-white p-4 sm:p-5 md:p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
              {quickActions.map((action, index) => (
                <motion.button
                  key={index}
                  whileHover={{ y: -8, scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleQuickActionClick(action.route)}
                  className={`flex flex-col items-center justify-center text-center gap-3 sm:gap-4 p-4 sm:p-6 md:p-8 rounded-2xl border-2 ${action.borderColor} ${action.bgColor} hover:shadow-xl transition-all duration-300 group relative overflow-hidden min-h-[150px] sm:min-h-[180px] cursor-pointer`}
                >
                  {/* Background Pattern */}
                  <div className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity">
                    <div className="absolute top-0 right-0 w-20 h-20 rounded-full bg-current transform translate-x-6 -translate-y-6"></div>
                    <div className="absolute bottom-0 left-0 w-16 h-16 rounded-full bg-current transform -translate-x-4 translate-y-4"></div>
                  </div>
                  
                  {/* Icon */}
                  <motion.div 
                    whileHover={{ rotate: 10, scale: 1.15 }}
                    className={`${action.color} ${action.hoverColor} p-3 sm:p-4 rounded-2xl text-white shadow-lg group-hover:shadow-xl transition-all duration-300 relative z-10`}
                  >
                    {action.icon}
                  </motion.div>
                  
                  {/* Content */}
                  <div className="relative z-10">
                    <h3 className="text-xs sm:text-sm md:text-base font-bold text-gray-800 mb-1 sm:mb-2 group-hover:text-gray-900 transition-colors leading-tight">
                      {action.title}
                    </h3>
                    <p className="text-xs md:text-sm text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors">
                      {action.description}
                    </p>
                  </div>
                  
                  {/* Arrow */}
                  <motion.div 
                    className="absolute bottom-3 sm:bottom-4 left-1/2 transform -translate-x-1/2"
                    whileHover={{ y: -2 }}
                  >
                    <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                  </motion.div>
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default ERP90Dashboard;