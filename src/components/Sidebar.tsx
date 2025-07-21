import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  BarChart3,
  Users,
  Settings,
  Receipt,
  Building,
  LogOut,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  Warehouse,
  ClipboardList,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  onLogout: () => void;
  customersCount?: number;
}

const menuItems = [
  {
    title: "لوحة التحكم",
    icon: BarChart3,
    href: "/",
  },
  {
    title: "إدارة الأعمال",
    icon: ClipboardList,
    children: [
      { title: "الفروع", href: "/business/branches" },
      { title: "طرق الدفع", href: "/business/payment-methods" },
    ],
  },
  {
    title: "الفواتير",
    icon: Receipt,
    children: [
      { title: "فواتير المبيعات", href: "/stores/sales" },
    ],
  },
  {
    title: "المخازن",
    icon: Warehouse,
    children: [
      { title: "إدارة المخازن", href: "/stores/manage" },
      { title: "الأصناف", href: "/stores/item" },
      { title: "مرتجع المبيعات", href: "/stores/sales-return" },
    ],
  },
  {
    title: "العملاء",
    icon: Users,
    href: "/customers",
    badge: true,
  },
  {
    title: "الموردين",
    icon: Building,
    href: "/suppliers",
  },
  {
    title: "المديرين",
    icon: Building,
    href: "/admin/admins",
  },
];

const Sidebar = ({ isCollapsed, onToggle, onLogout, customersCount }: SidebarProps) => {
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleExpanded = (title: string) => {
    setExpandedItems(prev => 
      prev.includes(title) 
        ? prev.filter(item => item !== title) 
        : [...prev, title]
    );
  };

  const isActive = (href: string) => location.pathname === href;
  const hasActiveChild = (children?: Array<{ href: string }>) => 
    children?.some(child => isActive(child.href));

  return (
    <>
      {/* Overlay for mobile */}
      {!isCollapsed && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden" 
          onClick={onToggle} 
        />
      )}

      {/* Sidebar container */}
      <div
        className={cn(
          "fixed right-0 top-0 h-screen bg-white border-l border-gray-200 z-50",
          "transition-all duration-300 transform lg:relative lg:z-auto",
          isCollapsed
            ? "w-16 translate-x-full lg:translate-x-0 lg:w-16"
            : "w-64 translate-x-0",
          "shadow-lg"
        )}
      >
        <div className="flex flex-col h-full">
          
          {/* Sidebar header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              {!isCollapsed && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="font-bold text-lg text-gray-900">نظام المحاسبة</h2>
                    <p className="text-sm text-gray-500">الإصدار الاحترافي</p>
                  </div>
                </div>
              )}

              <Button
                variant="ghost"
                size="sm"
                onClick={onToggle}
                className="lg:hidden"
              >
                {isCollapsed ? <Menu className="w-5 h-5" /> : <X className="w-5 h-5" />}
              </Button>
            </div>
          </div>

          {/* Navigation items */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {menuItems.map((item) => (
              <div key={item.title}>
                {item.children ? (
                  <div>
                    <button
                      onClick={() => toggleExpanded(item.title)}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium",
                        "transition-colors text-right",
                        hasActiveChild(item.children)
                          ? "bg-blue-50 text-blue-600"
                          : "text-gray-600 hover:bg-gray-100",
                        isCollapsed && "justify-center"
                      )}
                    >
                      <item.icon className="w-5 h-5 flex-shrink-0" />
                      {!isCollapsed && (
                        <>
                          <span className="flex-1">{item.title}</span>
                          {expandedItems.includes(item.title) ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </>
                      )}
                    </button>

                    {!isCollapsed && expandedItems.includes(item.title) && (
                      <div className="mr-8 mt-2 space-y-1">
                        {item.children.map((child) => (
                          <NavLink
                            key={child.href}
                            to={child.href}
                            className={({ isActive }) =>
                              cn(
                                "flex items-center px-3 py-2 rounded-md text-sm",
                                "transition-colors text-right",
                                isActive
                                  ? "bg-blue-50 text-blue-600 font-medium"
                                  : "text-gray-600 hover:bg-gray-100"
                              )
                            }
                          >
                            {child.title}
                          </NavLink>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <NavLink
                    to={item.href}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium",
                        "transition-colors text-right",
                        isActive
                          ? "bg-blue-50 text-blue-600"
                          : "text-gray-600 hover:bg-gray-100",
                        isCollapsed && "justify-center"
                      )
                    }
                  >
                    <item.icon className="w-5 h-5 flex-shrink-0" />
                    {!isCollapsed && (
                      <div className="flex items-center justify-between w-full">
                        <span>{item.title}</span>
                        {item.badge && customersCount && (
                          <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs">
                            {customersCount}
                          </span>
                        )}
                      </div>
                    )}
                  </NavLink>
                )}
              </div>
            ))}
          </nav>

          {/* Footer section */}
          <div className="p-4 border-t border-gray-200 space-y-2">
            <NavLink
              to="/settings"
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium",
                  "transition-colors text-right",
                  isActive
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-600 hover:bg-gray-100",
                  isCollapsed && "justify-center"
                )
              }
            >
              <Settings className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && <span>الإعدادات</span>}
            </NavLink>

            <button
              onClick={onLogout}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium",
                "transition-colors text-right text-red-600 hover:bg-red-50",
                isCollapsed && "justify-center"
              )}
            >
              <LogOut className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && <span>تسجيل الخروج</span>}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;