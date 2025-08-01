import { motion } from 'framer-motion';
import { Settings, Cog, Wrench, BarChart3, ArrowLeft, Plus, Filter, Download } from 'lucide-react';
import ManagementLayout from '@/components/ManagementLayout';
import { useNavigate } from 'react-router-dom';

const EquipmentManagement = () => {
  const navigate = useNavigate();
  
  return (
    <ManagementLayout>
      <div className="min-h-screen bg-gray-50 rtl" dir="rtl">
        <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-4">
            <button onClick={() => window.history.back()} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-3">
                <Settings className="w-8 h-8 text-amber-600" />
                إدارة المعدات والوحدات الإنتاجية
              </h1>
              <p className="text-gray-600 mt-1">إدارة المعدات والآلات والوحدات الإنتاجية</p>
            </div>
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center"
        >
          <Settings className="w-16 h-16 text-amber-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">إدارة المعدات والوحدات الإنتاجية</h2>
          <p className="text-gray-600">جاري العمل على هذه الصفحة...</p>
        </motion.div>
        </div>
      </div>
    </ManagementLayout>
  );
};

export default EquipmentManagement;
