

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Boxes, ClipboardList, TrendingUp, TrendingDown, Plus, FileText, Truck, Warehouse, BarChart3, Settings } from 'lucide-react';
import Breadcrumb from '../components/Breadcrumb';
import { Card, CardContent, CardTitle } from '@/components/ui/card';

const warehouseSettingsCards = [
//   {
//     title: "إعدادات المستودعات",
//     description: "إدارة إعدادات المستودعات",
//     icon: <Settings className="h-6 w-6" />,
//     color: "bg-blue-500"
//   },
//   {
//     title: "أنواع المستودعات",
//     description: "إدارة أنواع المستودعات",
//     icon: <Warehouse className="h-6 w-6" />,
//     color: "bg-green-500"
//   },
//   {
//     title: "إعدادات الأصناف",
//     description: "إدارة إعدادات الأصناف",
//     icon: <Boxes className="h-6 w-6" />,
//     color: "bg-emerald-500"
//   }
];

function useWarehouseOperationsCards() {
  const navigate = useNavigate();
  return [
    {
      title: "إضافة مستودع جديد",
      description: "إنشاء مستودع جديد",
      icon: <Plus className="h-6 w-6" />,
      color: "bg-blue-600",
      onClick: () => {
        navigate("/stores/advanced-warehouse");
      }
    },
    // {
    //   title: "إدخال أصناف",
    //   description: "إدخال أصناف إلى المستودع",
    //   icon: <FileText className="h-6 w-6" />,
    //   color: "bg-green-600"
    // },
    // {
    //   title: "إخراج أصناف",
    //   description: "إخراج أصناف من المستودع",
    //   icon: <Truck className="h-6 w-6" />,
    //   color: "bg-orange-600"
    // },
    {
      title: "جرد المستودع",
      description: "جرد الأصناف والمخزون",
      icon: <ClipboardList className="h-6 w-6" />,
      color: "bg-purple-600",
      onClick: () => {
        navigate("/stores/stock");
      }
    }
  ];
}

const warehouseReportsCards = [
//   {
//     title: "تقرير المخزون",
//     description: "تقرير شامل عن المخزون",
//     icon: <BarChart3 className="h-6 w-6" />,
//     color: "bg-blue-700"
//   },
//   {
//     title: "تقرير حركة الأصناف",
//     description: "تقرير حركة الأصناف داخل وخارج المستودع",
//     icon: <TrendingUp className="h-6 w-6" />,
//     color: "bg-green-700"
//   },
//   {
//     title: "تقرير الجرد",
//     description: "تقرير جرد المستودعات",
//     icon: <TrendingDown className="h-6 w-6" />,
//     color: "bg-orange-700"
//   }
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

const WarehouseManagement: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return (
    <div className="w-full p-6 space-y-8 min-h-screen" dir="rtl">
      {/* Header */}
      <div className="p-4 font-['Tajawal'] bg-white mb-4 rounded-lg shadow-[0_0_10px_rgba(0,0,0,0.1)] relative overflow-hidden">
        <div className="flex items-center">
          <Package className="h-8 w-8 text-orange-600 ml-3" />
          <h1 className="text-2xl font-bold text-gray-800">إدارة المخازن</h1>
        </div>
        <p className="text-gray-600 mt-2">إدارة النظام المخزني والمستودعات</p>
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-orange-400 to-purple-500"></div>
      </div>

      <Breadcrumb
        items={[ 
          { label: "الرئيسية", to: "/" },
          { label: "إدارة المخازن" }
        ]}
      />

      {/* إعدادات المستودعات Section */}
      <div className="space-y-6 bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center space-x-3 space-x-reverse">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Settings className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">إعدادات المستودعات</h2>
            <p className="text-gray-600">إعدادات النظام المخزني والمستودعات</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {warehouseSettingsCards.map((card, index) => (
            <CardComponent key={`settings-${index}`} card={card} index={index} />
          ))}
        </div>
      </div>

      {/* العمليات Section */}
      <div className="space-y-6 bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center space-x-3 space-x-reverse">
          <div className="p-2 bg-green-100 rounded-lg">
            <Boxes className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">العمليات</h2>
            <p className="text-gray-600">العمليات اليومية للمخزون والمستودعات</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {useWarehouseOperationsCards().map((card, index) => (
            <CardComponent key={`operations-${index}`} card={card} index={index} />
          ))}
        </div>
      </div>

      {/* التقارير Section */}
      <div className="space-y-6 bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center space-x-3 space-x-reverse">
          <div className="p-2 bg-purple-100 rounded-lg">
            <BarChart3 className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">التقارير</h2>
            <p className="text-gray-600">التقارير الشاملة للمخزون والمستودعات</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {warehouseReportsCards.map((card, index) => (
            <CardComponent key={`reports-${index}`} card={card} index={index} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default WarehouseManagement;
