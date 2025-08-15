import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Breadcrumb from "@/components/Breadcrumb";
import { 
  Settings, 
  FileText, 
  TreePine, 
  Calendar, 
  Clock, 
  Target, 
  CreditCard, 
  Wallet, 
  DollarSign,
  Calculator,
  BookOpen,
  TrendingUp,
  BarChart3,
  PiggyBank,
  Receipt,
  ArrowUpCircle,
  ArrowDownCircle,
  FileBarChart,
  Users,
  Building,
  UserCheck,
  ClipboardList,
  Package,
  TrendingDown,
  ShoppingCart,
  Plus,
  FileCheck,
  UserCog,
  Crown
} from 'lucide-react';

const FinancialManagement: React.FC = () => {
  const navigate = useNavigate();

  const settingsCards = [
    {
      title: "تصفية الحسابات",
      description: "إدارة وتصفية الحسابات المالية",
      icon: <FileText className="h-6 w-6" />,
      color: "bg-blue-500",
      onClick: () => navigate('/accounting/accounts-settlement')
    },
    {
      title: "دليل الحسابات",
      description: "عرض وإدارة دليل الحسابات الكامل",
      icon: <BookOpen className="h-6 w-6" />,
      color: "bg-green-500",
      onClick: () => navigate('/accounting/chart-of-accounts')
    },
    {
      title: "دليل الحسابات الشجري",
      description: "عرض الحسابات في شكل شجري",
      icon: <TreePine className="h-6 w-6" />,
      color: "bg-emerald-500"
    },
    {
      title: "السنوات المالية",
      description: "إدارة السنوات المالية للشركة",
      icon: <Calendar className="h-6 w-6" />,
      color: "bg-purple-500",
      onClick: () => navigate('/accounting/financial-years')
    },
    {
      title: "الفترات المحاسبية",
      description: "تحديد وإدارة الفترات المحاسبية",
      icon: <Clock className="h-6 w-6" />,
      color: "bg-orange-500"
    },
    {
      title: "مراكز التكلفة",
      description: "إدارة مراكز التكلفة والأقسام",
      icon: <Target className="h-6 w-6" />,
      color: "bg-red-500",
      onClick: () => navigate('/accounting/cost-centers')
    },
    {
      title: "الحسابات البنكية",
      description: "إدارة الحسابات البنكية للشركة",
      icon: <CreditCard className="h-6 w-6" />,
      color: "bg-indigo-500",
      onClick: () => navigate('/accounting/bank-accounts')
    },
    {
      title: "دليل مركز التكلفة",
      description: "دليل مراكز التكلفة الشامل",
      icon: <BarChart3 className="h-6 w-6" />,
      color: "bg-teal-500"
    },
    {
      title: "الصناديق النقدية",
      description: "إدارة الصناديق النقدية",
      icon: <Wallet className="h-6 w-6" />, 
      color: "bg-cyan-500",
      onClick: () => navigate('/accounting/cash-boxes')
    },
    {
      title: "إعدادات عامة",
      description: "الإعدادات العامة للنظام المالي",
      icon: <Settings className="h-6 w-6" />,
      color: "bg-gray-500"
    }
  ];

  const operationsCards = [
    {
      title: "الأرصدة الافتتاحية",
      description: "إدخال الأرصدة الافتتاحية للحسابات",
      icon: <DollarSign className="h-6 w-6" />,
      color: "bg-blue-600"
    },
    {
      title: "الموازنة التقديرية",
      description: "إعداد وإدارة الموازنة التقديرية",
      icon: <TrendingUp className="h-6 w-6" />,
      color: "bg-green-600"
    },
    {
      title: "أرصدة أول المدة",
      description: "أرصدة بداية الفترة المحاسبية",
      icon: <Calculator className="h-6 w-6" />,
      color: "bg-emerald-600"
    },
    {
      title: "قيود يومية",
      description: "إنشاء وإدارة القيود اليومية",
      icon: <FileText className="h-6 w-6" />,
      color: "bg-purple-600"
    },
    {
      title: "الترحيل للقيود",
      description: "ترحيل القيود إلى دفتر الأستاذ",
      icon: <ArrowUpCircle className="h-6 w-6" />,
      color: "bg-orange-600"
    },
    {
      title: "إلغاء الترحيل",
      description: "إلغاء ترحيل القيود المحاسبية",
      icon: <ArrowDownCircle className="h-6 w-6" />,
      color: "bg-red-600"
    },
    {
      title: "سندات القبض",
      description: "إنشاء وإدارة سندات القبض",
      icon: <Receipt className="h-6 w-6" />,
      color: "bg-indigo-600"
    },
    {
      title: "سند الصرف",
      description: "إنشاء وإدارة سندات الصرف",
      icon: <PiggyBank className="h-6 w-6" />,
      color: "bg-teal-600"
    }
  ];

  const reportsCards = [
    {
      title: "ميزان المراجعة",
      description: "تقرير ميزان المراجعة الشامل",
      icon: <BarChart3 className="h-6 w-6" />,
      color: "bg-blue-700"
    },
    {
      title: "كشف حساب",
      description: "كشف حساب تفصيلي",
      icon: <FileText className="h-6 w-6" />,
      color: "bg-green-700"
    },
    {
      title: "تقرير بسند القبض",
      description: "تقارير سندات القبض",
      icon: <Receipt className="h-6 w-6" />,
      color: "bg-emerald-700"
    },
    {
      title: "تقرير بسند الصرف",
      description: "تقارير سندات الصرف",
      icon: <PiggyBank className="h-6 w-6" />,
      color: "bg-purple-700"
    },
    {
      title: "حركة الأستاذ العام",
      description: "تقرير حركة الأستاذ العام",
      icon: <BookOpen className="h-6 w-6" />,
      color: "bg-orange-700"
    },
    {
      title: "دليل الحسابات",
      description: "تقرير دليل الحسابات",
      icon: <ClipboardList className="h-6 w-6" />,
      color: "bg-red-700"
    },
    {
      title: "تقرير بالقيود",
      description: "تقرير شامل بالقيود المحاسبية",
      icon: <FileBarChart className="h-6 w-6" />,
      color: "bg-indigo-700"
    },
    {
      title: "قائمة الدخل",
      description: "قائمة الدخل والمصروفات",
      icon: <TrendingUp className="h-6 w-6" />,
      color: "bg-teal-700"
    },
    {
      title: "كشف حساب مجموعة",
      description: "كشف حساب المجموعات",
      icon: <Target className="h-6 w-6" />,
      color: "bg-cyan-700"
    },
    {
      title: "مصادر الأموال",
      description: "تقرير مصادر الأموال",
      icon: <DollarSign className="h-6 w-6" />,
      color: "bg-gray-700"
    },
    {
      title: "الأرباح والخسائر",
      description: "قائمة الأرباح والخسائر",
      icon: <Calculator className="h-6 w-6" />,
      color: "bg-rose-700"
    },
    {
      title: "كشف حساب عميل",
      description: "كشف حساب العملاء",
      icon: <Users className="h-6 w-6" />,
      color: "bg-violet-700"
    },
    {
      title: "كشف حساب مورد",
      description: "كشف حساب الموردين",
      icon: <Building className="h-6 w-6" />,
      color: "bg-amber-700"
    },
    {
      title: "كشف حساب موظف",
      description: "كشف حساب الموظفين",
      icon: <UserCheck className="h-6 w-6" />,
      color: "bg-lime-700"
    }
  ];

  const fixedAssetsCards = [
    {
      title: "سجل الأصول الثابتة",
      description: "عرض وإدارة سجل الأصول الثابتة",
      icon: <Package className="h-6 w-6" />,
      color: "bg-indigo-600"
    },
    {
      title: "إهلاك أصل",
      description: "حساب وإدارة إهلاك الأصول",
      icon: <TrendingDown className="h-6 w-6" />,
      color: "bg-red-600"
    },
    {
      title: "شراء أصل",
      description: "تسجيل شراء الأصول الثابتة",
      icon: <ShoppingCart className="h-6 w-6" />,
      color: "bg-green-600"
    },
    {
      title: "إضافة أصل",
      description: "إضافة أصل ثابت جديد",
      icon: <Plus className="h-6 w-6" />,
      color: "bg-blue-600"
    }
  ];

  const financialRequestsCards = [
    {
      title: "طلب مالي",
      description: "إنشاء وإدارة الطلبات المالية",
      icon: <FileCheck className="h-6 w-6" />,
      color: "bg-purple-600"
    },
    {
      title: "المدير المالي",
      description: "صلاحيات ومهام المدير المالي",
      icon: <UserCog className="h-6 w-6" />,
      color: "bg-orange-600"
    },
    {
      title: "المدير العام",
      description: "صلاحيات ومهام المدير العام",
      icon: <Crown className="h-6 w-6" />,
      color: "bg-amber-600"
    }
  ];

  interface CardType {
    title: string;
    description: string;
    icon: React.ReactNode;
    color: string;
    onClick?: () => void;
  }

  const CardComponent = ({ card, index }: { card: CardType, index: number }) => (
    <Card 
      key={index}
      className="group hover:shadow-lg transition-all duration-300 cursor-pointer hover:scale-105"
      onClick={card.onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center space-x-2 space-x-reverse">
          <div className={`p-2 rounded-lg ${card.color} text-white`}>
            {card.icon}
          </div>
          <CardTitle className="text-sm text-right">{card.title}</CardTitle>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="w-full p-6 space-y-8 min-h-screen" dir="rtl">
      {/* Header */}
    
       <div className="p-4 font-['Tajawal'] bg-white mb-4 rounded-lg shadow-[0_0_10px_rgba(0,0,0,0.1)] relative overflow-hidden">
         <div className="flex items-center">
           <FileText className="h-8 w-8 text-blue-600 ml-3" />
           <h1 className="text-2xl font-bold text-gray-800">الاداره الماليه</h1>
         </div>
         <p className="text-gray-600 mt-2">إدارة النظام المالي والمحاسبي</p>
         <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-purple-500"></div>
       </div>

       <Breadcrumb
        items={[
          { label: "الرئيسية", to: "/" },
          { label: "الادارة الماليه" }, 

        ]}
      />
      {/* الإعدادات Section */}
      <div className="space-y-6 bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center space-x-3 space-x-reverse">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Settings className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">الإعدادات</h2>
            <p className="text-gray-600">إعدادات النظام المالي والمحاسبي</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {settingsCards.map((card, index) => (
            <CardComponent key={`settings-${index}`} card={card} index={index} />
          ))}
        </div>
      </div>

      {/* العمليات Section */}
      <div className="space-y-6 bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center space-x-3 space-x-reverse">
          <div className="p-2 bg-green-100 rounded-lg">
            <Calculator className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">العمليات</h2>
            <p className="text-gray-600">العمليات المحاسبية والمالية اليومية</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {operationsCards.map((card, index) => (
            <CardComponent key={`operations-${index}`} card={card} index={index} />
          ))}
        </div>
      </div>

      {/* التقارير Section */}
      <div className="space-y-6 bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center space-x-3 space-x-reverse">
          <div className="p-2 bg-purple-100 rounded-lg">
            <FileBarChart className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">التقارير</h2>
            <p className="text-gray-600">التقارير المالية والمحاسبية الشاملة</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {reportsCards.map((card, index) => (
            <CardComponent key={`reports-${index}`} card={card} index={index} />
          ))}
        </div>
      </div>

      {/* الأصول الثابتة Section */}
      <div className="space-y-6 bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center space-x-3 space-x-reverse">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <Package className="h-6 w-6 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">الأصول الثابتة</h2>
            <p className="text-gray-600">إدارة الأصول الثابتة والإهلاك</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {fixedAssetsCards.map((card, index) => (
            <CardComponent key={`fixed-assets-${index}`} card={card} index={index} />
          ))}
        </div>
      </div>

      {/* الطلبات المالية Section */}
      <div className="space-y-6 bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center space-x-3 space-x-reverse">
          <div className="p-2 bg-purple-100 rounded-lg">
            <FileCheck className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">الطلبات المالية</h2>
            <p className="text-gray-600">إدارة الطلبات المالية والموافقات</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {financialRequestsCards.map((card, index) => (
            <CardComponent key={`financial-requests-${index}`} card={card} index={index} />
          ))}
        </div>
      </div>


    </div>
  );
};

export default FinancialManagement;