import { motion } from 'framer-motion';
import { 
  Users, UserPlus, Calendar, Clock, 
  DollarSign, Award, TrendingUp, UserCheck,
  ArrowLeft, Plus, Filter, Download
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const HumanResources = () => {
  const navigate = useNavigate();
  const hrCards = [
    { title: "إجمالي الموظفين", icon: <Users className="w-6 h-6" />, value: "245", change: "+12", color: "bg-blue-500" },
    { title: "الموظفين الحاضرين", icon: <UserCheck className="w-6 h-6" />, value: "238", change: "97%", color: "bg-green-500" },
    { title: "الرواتب الشهرية", icon: <DollarSign className="w-6 h-6" />, value: "850,000 ر.س", change: "+5%", color: "bg-purple-500" },
    { title: "الإجازات المعلقة", icon: <Calendar className="w-6 h-6" />, value: "23", change: "-8", color: "bg-orange-500" }
  ];

  const quickActions = [
    { title: "إضافة موظف", icon: <UserPlus className="w-5 h-5" />, color: "bg-blue-500" },
    { title: "تسجيل حضور", icon: <Clock className="w-5 h-5" />, color: "bg-green-500" },
    { title: "إدارة الرواتب", icon: <DollarSign className="w-5 h-5" />, color: "bg-purple-500" },
    { title: "تقييم الأداء", icon: <Award className="w-5 h-5" />, color: "bg-orange-500" }
  ];

  return (
      <div className="min-h-screen bg-gray-50 rtl" dir="rtl">
        <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-4">
            <button 
              onClick={() => window.history.back()}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-3">
                <Users className="w-8 h-8 text-emerald-600" />
                الموارد البشرية
              </h1>
              <p className="text-gray-600 mt-1">إدارة الموظفين والرواتب والحضور والانصراف</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">
              <Plus className="w-4 h-4" />
              موظف جديد
            </button>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Filter className="w-4 h-4" />
              تصفية
            </button>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Download className="w-4 h-4" />
              تصدير
            </button>
          </div>
        </motion.div>

        {/* HR Overview Cards */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {hrCards.map((card, index) => (
            <motion.div
              key={index}
              whileHover={{ y: -5, scale: 1.02 }}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`${card.color} p-3 rounded-lg text-white`}>
                  {card.icon}
                </div>
                <span className="text-sm font-medium px-2 py-1 rounded-full bg-emerald-100 text-emerald-800">
                  {card.change}
                </span>
              </div>
              <h3 className="text-gray-600 text-sm mb-1">{card.title}</h3>
              <p className="text-2xl font-bold text-gray-800">{card.value}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Quick Actions */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8"
        >
          <h2 className="text-xl font-bold text-gray-800 mb-4">إجراءات سريعة</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <motion.button
                key={index}
                whileHover={{ y: -3, scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="flex flex-col items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/50 transition-all"
              >
                <div className={`${action.color} p-3 rounded-lg text-white`}>
                  {action.icon}
                </div>
                <span className="text-sm font-medium text-gray-700">{action.title}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Recent Employee Activities */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">أنشطة الموظفين الحديثة</h2>
            <button className="text-emerald-600 hover:text-emerald-800 text-sm font-medium">
              عرض الكل
            </button>
          </div>
          
          <div className="space-y-4">
            {[
              { id: 1, name: "أحمد محمد", action: "تسجيل دخول", time: "8:30 صباحاً", status: "نشط", avatar: "أ" },
              { id: 2, name: "فاطمة علي", action: "طلب إجازة", time: "منذ ساعة", status: "قيد المراجعة", avatar: "ف" },
              { id: 3, name: "محمد سالم", action: "تقديم تقرير", time: "منذ ساعتين", status: "مكتمل", avatar: "م" },
              { id: 4, name: "نورا أحمد", action: "تسجيل خروج", time: "5:00 مساءً", status: "مكتمل", avatar: "ن" }
            ].map((activity) => (
              <motion.div 
                key={activity.id}
                whileHover={{ x: -5 }}
                className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-emerald-500 text-white rounded-full flex items-center justify-center font-medium">
                    {activity.avatar}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{activity.name}</p>
                    <p className="text-sm text-gray-500">{activity.action} - {activity.time}</p>
                  </div>
                </div>
                <span className={`text-xs px-3 py-1 rounded-full ${
                  activity.status === 'نشط' ? 'bg-green-100 text-green-800' :
                  activity.status === 'مكتمل' ? 'bg-blue-100 text-blue-800' : 
                  'bg-amber-100 text-amber-800'
                }`}>
                  {activity.status}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
        </div>
      </div>
  );
};

export default HumanResources;
