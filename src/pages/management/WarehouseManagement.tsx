import { motion } from 'framer-motion';
import { 
  Package, Truck, BarChart3, AlertTriangle,
  Plus, ArrowLeft, Filter, Download,
  Archive, TrendingDown, TrendingUp, Box
} from 'lucide-react';

import { useNavigate } from 'react-router-dom';

const WarehouseManagement = () => {
  const navigate = useNavigate();

  const warehouseCards = [
    { title: "إجمالي المنتجات", icon: <Package className="w-6 h-6" />, value: "1,245", change: "+45", color: "bg-orange-500" },
    { title: "قيمة المخزون", icon: <BarChart3 className="w-6 h-6" />, value: "2,850,000 ر.س", change: "+12%", color: "bg-blue-500" },
    { title: "منتجات منخفضة", icon: <AlertTriangle className="w-6 h-6" />, value: "23", change: "-5", color: "bg-red-500" },
    { title: "الشحنات اليوم", icon: <Truck className="w-6 h-6" />, value: "45", change: "+8", color: "bg-green-500" }
  ];

  const quickActions = [
    { title: "إضافة منتج", icon: <Plus className="w-5 h-5" />, color: "bg-orange-500" },
    { title: "إدارة المخزون", icon: <Archive className="w-5 h-5" />, color: "bg-blue-500" },
    { title: "تتبع الشحنات", icon: <Truck className="w-5 h-5" />, color: "bg-green-500" },
    { title: "تقرير المخزون", icon: <BarChart3 className="w-5 h-5" />, color: "bg-purple-500" }
  ];

  return (
    <ManagementLayout>
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
                <Package className="w-8 h-8 text-orange-600" />
                إدارة المخازن
              </h1>
              <p className="text-gray-600 mt-1">إدارة المخزون والمستودعات والشحنات</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
              <Plus className="w-4 h-4" />
              منتج جديد
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

        {/* Warehouse Overview Cards */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {warehouseCards.map((card, index) => (
            <motion.div
              key={index}
              whileHover={{ y: -5, scale: 1.02 }}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`${card.color} p-3 rounded-lg text-white`}>
                  {card.icon}
                </div>
                <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                  card.change.startsWith('+') ? 'bg-green-100 text-green-800' : 
                  card.change.startsWith('-') ? 'bg-red-100 text-red-800' :
                  'bg-orange-100 text-orange-800'
                }`}>
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
                className="flex flex-col items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-orange-300 hover:bg-orange-50/50 transition-all"
              >
                <div className={`${action.color} p-3 rounded-lg text-white`}>
                  {action.icon}
                </div>
                <span className="text-sm font-medium text-gray-700">{action.title}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Recent Inventory Activities */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">حركات المخزون الحديثة</h2>
            <button className="text-orange-600 hover:text-orange-800 text-sm font-medium">
              عرض الكل
            </button>
          </div>
          
          <div className="space-y-4">
            {[
              { id: 1, product: "لابتوب HP EliteBook", type: "دخول", quantity: "+50", time: "منذ ساعة", status: "مكتمل" },
              { id: 2, product: "هاتف iPhone 15", type: "خروج", quantity: "-25", time: "منذ ساعتين", status: "مكتمل" },
              { id: 3, product: "شاشة Samsung 27 بوصة", type: "دخول", quantity: "+30", time: "منذ 3 ساعات", status: "قيد المعالجة" },
              { id: 4, product: "ماوس لاسلكي Logitech", type: "خروج", quantity: "-100", time: "منذ يوم", status: "مكتمل" }
            ].map((activity) => (
              <motion.div 
                key={activity.id}
                whileHover={{ x: -5 }}
                className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-lg ${
                    activity.type === 'دخول' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                  }`}>
                    {activity.type === 'دخول' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{activity.product}</p>
                    <p className="text-sm text-gray-500">{activity.type} - {activity.time}</p>
                  </div>
                </div>
                <div className="text-left">
                  <p className={`font-bold ${
                    activity.quantity.startsWith('+') ? 'text-green-600' : 'text-blue-600'
                  }`}>
                    {activity.quantity}
                  </p>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    activity.status === 'مكتمل' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {activity.status}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
        </div>
      </div>
    </ManagementLayout>
  );
};

export default WarehouseManagement;
