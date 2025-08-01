import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { 
  Home, Users, FileText, ShoppingCart, BarChart2, Settings,
  CreditCard, Package, Truck, Database, Bell, HelpCircle,
  Search, Plus, ArrowRight, ChevronLeft, ChevronRight,
  Zap, Server, Clock, AlertCircle, CheckCircle
} from 'lucide-react';

const ERP90Dashboard = () => {
  const [activeSlide, setActiveSlide] = useState(0);
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([
    { id: 1, text: 'فاتورة جديدة من العميل أحمد', time: 'منذ 5 دقائق', read: false },
    { id: 2, text: 'دفعة مستحقة للموردين', time: 'منذ ساعة', read: false },
    { id: 3, text: 'تحديث النظام متاح', time: 'منذ يوم', read: true }
  ]);

  const controls = useAnimation();

  const quickActions = [
    { title: "الإدارة المالية", icon: <CreditCard className="w-5 h-5" />, color: "bg-gradient-to-br from-blue-500 to-blue-600", hoverColor: "hover:from-blue-600 hover:to-blue-700", bgColor: "bg-blue-50", borderColor: "border-blue-200", description: "إدارة الحسابات والميزانيات", route: "/management/financial" },
    { title: "الموارد البشرية", icon: <Users className="w-5 h-5" />, color: "bg-gradient-to-br from-emerald-500 to-emerald-600", hoverColor: "hover:from-emerald-600 hover:to-emerald-700", bgColor: "bg-emerald-50", borderColor: "border-emerald-200", description: "إدارة الموظفين والرواتب", route: "/management/hr" },
    { title: "إدارة المخازن", icon: <Package className="w-5 h-5" />, color: "bg-gradient-to-br from-orange-500 to-orange-600", hoverColor: "hover:from-orange-600 hover:to-orange-700", bgColor: "bg-orange-50", borderColor: "border-orange-200", description: "إدارة المخزون والمستودعات", route: "/management/warehouse" },
    { title: "إدارة المشاريع", icon: <FileText className="w-5 h-5" />, color: "bg-gradient-to-br from-purple-500 to-purple-600", hoverColor: "hover:from-purple-600 hover:to-purple-700", bgColor: "bg-purple-50", borderColor: "border-purple-200", description: "متابعة وإدارة المشاريع", route: "/management/projects" },
    { title: "إدارة المبيعات والعملاء", icon: <ShoppingCart className="w-5 h-5" />, color: "bg-gradient-to-br from-rose-500 to-rose-600", hoverColor: "hover:from-rose-600 hover:to-rose-700", bgColor: "bg-rose-50", borderColor: "border-rose-200", description: "إدارة العملاء والمبيعات", route: "/management/sales" },
    { title: "إدارة المشتريات والموردين", icon: <Truck className="w-5 h-5" />, color: "bg-gradient-to-br from-teal-500 to-teal-600", hoverColor: "hover:from-teal-600 hover:to-teal-700", bgColor: "bg-teal-50", borderColor: "border-teal-200", description: "إدارة الموردين والمشتريات", route: "/management/purchase" },
    { title: "إدارة المناقصات والعقود", icon: <FileText className="w-5 h-5" />, color: "bg-gradient-to-br from-indigo-500 to-indigo-600", hoverColor: "hover:from-indigo-600 hover:to-indigo-700", bgColor: "bg-indigo-50", borderColor: "border-indigo-200", description: "إدارة العقود والمناقصات", route: "/management/contracts" },
    { title: "إدارة المعدات والوحدات الإنتاجية", icon: <Settings className="w-5 h-5" />, color: "bg-gradient-to-br from-amber-500 to-amber-600", hoverColor: "hover:from-amber-600 hover:to-amber-700", bgColor: "bg-amber-50", borderColor: "border-amber-200", description: "إدارة المعدات والإنتاج", route: "/management/equipment" }
  ];

  const slides = [
    {
      title: "مرحبًا بك في ERP90",
      description: "نظام متكامل لإدارة أعمالك بكل كفاءة واحترافية",
      image: "/erp90-dashboard.png",
      cta: "ابدأ الآن"
    },
    {
      title: "إدارة الفواتير",
      description: "أصدر فواتيرك بسهولة واحتفظ بسجل كامل لجميع معاملاتك",
      image: "/erp90-dashboard.png",
      cta: "إنشاء فاتورة"
    },
    {
      title: "تقارير متقدمة",
      description: "احصل على تحليلات دقيقة لأداء عملك باتقان",
      image: "/erp90-dashboard.png",
      cta: "عرض التقارير"
    }
  ];

  const recentActivities = [
    { id: 1, type: "invoice", title: "فاتورة مبيعات #2024-105", amount: "15,750 ر.س", time: "منذ 15 دقيقة", status: "paid" },
    { id: 2, type: "payment", title: "دفعة من العميل محمد", amount: "8,500 ر.س", time: "منذ ساعتين", status: "completed" },
    { id: 3, type: "expense", title: "فاتورة كهرباء", amount: "2,350 ر.س", time: "منذ يوم", status: "pending" },
    { id: 4, type: "invoice", title: "فاتورة مبيعات #2024-104", amount: "22,100 ر.س", time: "منذ يومين", status: "paid" }
  ];

  const systemStatus = [
    { name: "قاعدة البيانات", status: "active", icon: <Database />, color: "green" },
    { name: "آخر تحديث", status: "v2.4.1", icon: <Server />, color: "blue" },
    { name: "أداء النظام", status: "سريع جدًا", icon: <Zap />, color: "amber" },
    { name: "وقت التشغيل", status: "99.9%", icon: <Clock />, color: "indigo" }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(interval);
  }, [slides.length]);

  useEffect(() => {
    controls.start({
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    });
    AOS.init({ duration: 700, once: true });
  }, [controls]);

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  return (
    <div className="min-h-screen bg-gray-50 rtl" dir="rtl">
      {/* Main Content */}
      <main className="p-4 md:p-6 lg:p-8 max-w-8xl mx-auto">
        {/* Hero Slideshow */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={controls}
          className="relative mb-6 md:mb-8 h-56 md:h-64 lg:h-72 rounded-xl overflow-hidden shadow-lg"
          data-aos="fade-up"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSlide}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 flex items-center"

              style={{
                backgroundImage: `linear-gradient(to top, rgba(67,56,202,0.85) 50%, rgba(67,56,202,0.0) 100%), url(${slides[activeSlide].image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
              }}
            >
              <div className="absolute inset-0 bg-black/20"></div>
              <div className="relative z-10 px-6 md:px-12 w-full flex items-center justify-between">
                <div className="text-white max-w-lg">
                  <motion.h2 
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-2xl md:text-3xl font-bold mb-3"
                  >
                    {slides[activeSlide].title}
                  </motion.h2>
                  <motion.p 
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="mb-4 md:mb-6 text-sm md:text-base"
                  >
                    {slides[activeSlide].description}
                  </motion.p>
                  <motion.button
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-white text-indigo-600 px-4 py-2 md:px-6 md:py-2 rounded-lg font-medium hover:bg-gray-100 transition-all shadow-md"
                  >
                    {slides[activeSlide].cta} <ArrowRight className="inline mr-1" />
                  </motion.button>
                </div>
                {/* الصورة الآن خلفية، لا داعي لعنصر img */}
              </div>
            </motion.div>
          </AnimatePresence>
          
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-10">
            {slides.map((_, index) => (
              <motion.button
                key={index}
                onClick={() => setActiveSlide(index)}
                whileHover={{ scale: 1.2 }}
                className={`w-2 h-2 md:w-3 md:h-3 rounded-full ${activeSlide === index ? 'bg-white' : 'bg-white/50'}`}
              />
            ))}
          </div>
          
          <button 
            onClick={() => setActiveSlide(prev => (prev === 0 ? slides.length - 1 : prev - 1))}
            className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 bg-white/30 text-white p-1 md:p-2 rounded-full z-10 hover:bg-white/50 transition-all"
          >
            <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
          </button>
          
          <button 
            onClick={() => setActiveSlide(prev => (prev === slides.length - 1 ? 0 : prev + 1))}
            className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 bg-white/30 text-white p-1 md:p-2 rounded-full z-10 hover:bg-white/50 transition-all"
          >
            <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        </motion.div>

        {/* App Introduction */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={controls}
          transition={{ delay: 0.2 }}
          className="mb-6 md:mb-8"
          data-aos="fade-up"
        >
          <div className="bg-white p-5 md:p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-3">ما هو ERP90؟</h2>
            <p className="text-gray-700 leading-relaxed mb-4 text-sm md:text-base">
              <span className="font-bold text-indigo-600">ERP90</span> هو نظام متكامل لإدارة موارد المؤسسات والشركات، صُمم خصيصًا لتسهيل العمليات المالية والإدارية، ومتابعة الفواتير، والمخزون، والعملاء، والتقارير، وغير ذلك الكثير. يهدف البرنامج إلى رفع كفاءة العمل وتوفير الوقت والجهد من خلال واجهة سهلة الاستخدام وأدوات متقدمة تلبي احتياجات مختلف القطاعات.
            </p>
            <div className="mt-4 border-t pt-4 flex flex-col md:flex-row md:justify-between gap-2">
              <p className="text-xs md:text-sm text-gray-500">

                <span className="font-bold text-gray-700">المطور البرمجي:</span> محمد عبده رشاد
              </p>
              <p className="text-xs md:text-sm text-gray-500">
                <span className="font-bold text-gray-700">المطور المحاسبي:</span> عبده رشاد البهي
              </p>
              <p className="text-xs md:text-sm text-gray-500">
                <span className="font-bold text-gray-700">الإصدار:</span> 2.4.1
              </p>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={controls}
          transition={{ delay: 0.3 }}
          className="mb-6 md:mb-8"
          data-aos="fade-up"
        >
          <div className="bg-white p-5 md:p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg md:text-xl font-bold text-gray-800">إجراءات سريعة</h2>
              <button className="text-xs md:text-sm text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                المزيد <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {quickActions.map((action, index) => (
                <motion.button
                  key={index}
                  whileHover={{ y: -8, scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => navigate(action.route)}
                  className={`flex flex-col items-center justify-center text-center gap-4 p-6 md:p-8 rounded-2xl border-2 ${action.borderColor} ${action.bgColor} hover:shadow-xl transition-all duration-300 group relative overflow-hidden min-h-[180px] cursor-pointer`}
                >
                  {/* Background Pattern */}
                  <div className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity">
                    <div className="absolute top-0 right-0 w-20 h-20 rounded-full bg-current transform translate-x-6 -translate-y-6"></div>
                    <div className="absolute bottom-0 left-0 w-16 h-16 rounded-full bg-current transform -translate-x-4 translate-y-4"></div>
                  </div>
                  
                  {/* Icon */}
                  <motion.div 
                    whileHover={{ rotate: 10, scale: 1.15 }}
                    className={`${action.color} ${action.hoverColor} p-4 rounded-2xl text-white shadow-lg group-hover:shadow-xl transition-all duration-300 relative z-10`}
                  >
                    {action.icon}
                  </motion.div>
                  
                  {/* Content */}
                  <div className="relative z-10">
                    <h3 className="text-sm md:text-base font-bold text-gray-800 mb-2 group-hover:text-gray-900 transition-colors leading-tight">
                      {action.title}
                    </h3>
                    <p className="text-xs md:text-sm text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors">
                      {action.description}
                    </p>
                  </div>
                  
                  {/* Arrow */}
                  <motion.div 
                    className="absolute bottom-4 left-1/2 transform -translate-x-1/2"
                    whileHover={{ y: -2 }}
                  >
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                  </motion.div>
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Notifications & System Status */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={controls}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6"
          data-aos="fade-up"
        >
          {/* Notifications */}
          <div className="bg-white p-5 md:p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg md:text-xl font-bold text-gray-800 flex items-center gap-2">
                <Bell className="text-indigo-600 w-5 h-5" /> الإشعارات
              </h2>
              <div className="flex gap-2">
                <button 
                  onClick={markAllAsRead}
                  className="text-xs md:text-sm text-indigo-600 hover:text-indigo-800"
                >
                  تعيين كمقروء
                </button>
                <button className="text-xs md:text-sm text-indigo-600 hover:text-indigo-800">
                  عرض الكل
                </button>
              </div>
            </div>
            
            <div className="space-y-2 md:space-y-3">
              {notifications.map((notification) => (
                <motion.div 
                  key={notification.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`p-3 rounded-lg ${notification.read ? 'bg-gray-50' : 'bg-indigo-50 border border-indigo-100'} transition-all`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex gap-3">
                      <div className={`mt-1 flex-shrink-0 ${notification.read ? 'text-gray-400' : 'text-indigo-500'}`}>
                        {notification.read ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                      </div>
                      <div>
                        <p className="font-medium text-sm md:text-base">{notification.text}</p>
                        <p className="text-xs md:text-sm text-gray-500 mt-1">{notification.time}</p>
                      </div>
                    </div>
                    {!notification.read && (
                      <span className="w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0 mt-2"></span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* System Status */}
          <div className="bg-white p-5 md:p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-lg md:text-xl font-bold text-gray-800 flex items-center gap-2 mb-4">
              <Server className="text-indigo-600 w-5 h-5" /> حالة النظام
            </h2>
            
            <div className="space-y-3 md:space-y-4">
              {systemStatus.map((item, index) => (
                <motion.div 
                  key={index}
                  whileHover={{ x: -5 }}
                  className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 bg-${item.color}-100 rounded-lg text-${item.color}-600`}>
                      {item.icon}
                    </div>
                    <div>
                      <h3 className="font-medium text-sm md:text-base">{item.name}</h3>
                      <p className="text-xs md:text-sm text-gray-500">حالة النظام</p>
                    </div>
                  </div>
                  <span className={`text-xs md:text-sm text-${item.color}-600 font-medium`}>
                    {item.status}
                  </span>
                </motion.div>
              ))}
            </div>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full mt-4 md:mt-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-all shadow-md"
            >
              فحص شامل للنظام
            </motion.button>
          </div>
        </motion.div>

        {/* Recent Activities */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={controls}
          transition={{ delay: 0.5 }}
          className="mt-6 md:mt-8"
          data-aos="fade-up"
        >
          <div className="bg-white p-5 md:p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg md:text-xl font-bold text-gray-800 flex items-center gap-2">
                <Clock className="text-indigo-600 w-5 h-5" /> النشاطات الحديثة
              </h2>
              <button className="text-xs md:text-sm text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                عرض السجل الكامل <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-3 md:space-y-4">
              {recentActivities.map((activity) => (
                <motion.div 
                  key={activity.id}
                  whileHover={{ scale: 1.01 }}
                  className="p-3 rounded-lg border border-gray-100 hover:border-indigo-100 hover:bg-indigo-50/30 transition-all"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-sm md:text-base">{activity.title}</p>
                      <p className="text-xs md:text-sm text-gray-500 mt-1">{activity.time}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm md:text-base">{activity.amount}</p>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        activity.status === 'paid' ? 'bg-green-100 text-green-800' : 
                        activity.status === 'completed' ? 'bg-blue-100 text-blue-800' : 
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {activity.status === 'paid' ? 'مدفوعة' : 
                         activity.status === 'completed' ? 'مكتملة' : 'قيد الانتظار'}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default ERP90Dashboard;