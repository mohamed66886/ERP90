import { useState, useEffect } from 'react';
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
  const [notifications, setNotifications] = useState([
    { id: 1, text: 'فاتورة جديدة من العميل أحمد', time: 'منذ 5 دقائق', read: false },
    { id: 2, text: 'دفعة مستحقة للموردين', time: 'منذ ساعة', read: false },
    { id: 3, text: 'تحديث النظام متاح', time: 'منذ يوم', read: true }
  ]);

  const controls = useAnimation();

  const quickActions = [
    { title: "فاتورة مبيعات", icon: <FileText className="w-5 h-5" />, color: "bg-blue-500" },
    { title: "فاتورة مشتريات", icon: <ShoppingCart className="w-5 h-5" />, color: "bg-green-500" },
    { title: "قيد يومية", icon: <Database className="w-5 h-5" />, color: "bg-purple-500" },
    { title: "إضافة عميل", icon: <Users className="w-5 h-5" />, color: "bg-amber-500" },
    { title: "تقرير مالي", icon: <BarChart2 className="w-5 h-5" />, color: "bg-rose-500" },
    { title: "إعدادات", icon: <Settings className="w-5 h-5" />, color: "bg-gray-500" }
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
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
              {[...quickActions,
                { title: "إضافة مورد", icon: <Package className="w-5 h-5" />, color: "bg-teal-500" },
                { title: "إدارة المخزون", icon: <Truck className="w-5 h-5" />, color: "bg-orange-500" },
                { title: "بحث متقدم", icon: <Search className="w-5 h-5" />, color: "bg-cyan-500" },
                { title: "مساعدة", icon: <HelpCircle className="w-5 h-5" />, color: "bg-pink-500" },
                { title: "تنبيهات", icon: <Bell className="w-5 h-5" />, color: "bg-lime-500" },
                { title: "إضافة منتج", icon: <Plus className="w-5 h-5" />, color: "bg-violet-500" }
              ].map((action, index) => (
                <motion.button
                  key={index}
                  whileHover={{ y: -3, scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="flex flex-col items-center justify-center gap-2 p-3 md:p-4 rounded-lg border border-gray-100 hover:border-indigo-100 hover:bg-indigo-50/50 transition-all"
                >
                  <motion.div 
                    whileHover={{ rotate: 5, scale: 1.1 }}
                    className={`${action.color} p-2 md:p-3 rounded-full text-white shadow-sm`}
                  >
                    {action.icon}
                  </motion.div>
                  <span className="text-xs md:text-sm font-medium text-center">{action.title}</span>
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