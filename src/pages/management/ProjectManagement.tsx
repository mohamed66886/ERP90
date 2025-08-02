import { motion } from 'framer-motion';
import { FileText, Calendar, Users, CheckCircle, ArrowLeft, Plus, Filter, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ProjectManagement = () => {
  const navigate = useNavigate();
  
  return (
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
                <FileText className="w-8 h-8 text-purple-600" />
                إدارة المشاريع
              </h1>
              <p className="text-gray-600 mt-1">متابعة وإدارة المشاريع والمهام</p>
            </div>
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center"
        >
          <FileText className="w-16 h-16 text-purple-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">إدارة المشاريع</h2>
          <p className="text-gray-600">جاري العمل على هذه الصفحة...</p>
        </motion.div>
        </div>
      </div>
  );
};

export default ProjectManagement;
