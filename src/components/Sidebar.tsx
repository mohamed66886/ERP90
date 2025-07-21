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
import { title } from "process";

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
      { title: "فواتير المشتريات", href: "/stores/purchases" },
    ],
  },
  {
    title: "المخازن",
    icon: Warehouse,
    children: [
      { title: "إدارة المخازن", href: "/stores/manage" },
      { title: "الأصناف", href: "/stores/item" },
      { title: "مرتجع المبيعات", href: "/stores/sales-return" },
      {title : "مرتجع المشتريات", href: "/stores/purchases-return"},
      { title: "المخزون", href: "/stores/stock" }
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
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

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
        <div className="flex flex-col sidebar-nav-maxheight">
          
          {/* Navigation items */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {menuItems.map((item) => (
              <div 
                key={item.title}
                className="relative"
                onMouseEnter={() => isCollapsed && item.children && setHoveredItem(item.title)}
                onMouseLeave={() => isCollapsed && setHoveredItem(null)}
              >
                {item.children ? (
                  <div>
                    <button
                      onClick={() => toggleExpanded(item.title)}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium",
                        "transition-all duration-200 text-right",
                        hasActiveChild(item.children)
                          ? "bg-blue-50 text-blue-600"
                          : "text-gray-600 hover:bg-gray-100",
                        isCollapsed && "justify-center",
                        isCollapsed && hoveredItem === item.title && "bg-blue-50 scale-105"
                      )}
                    >
                      <item.icon className="w-5 h-5 flex-shrink-0 transition-transform duration-200" />
                      {!isCollapsed && (
                        <>
                          <span className="flex-1">{item.title}</span>
                          {expandedItems.includes(item.title) ? (
                            <ChevronDown className="w-4 h-4 transition-transform duration-200" />
                          ) : (
                            <ChevronRight className="w-4 h-4 transition-transform duration-200" />
                          )}
                        </>
                      )}
                    </button>

                    {/* Expanded menu for desktop */}
                    {!isCollapsed && expandedItems.includes(item.title) && (
                      <div 
                        className="mr-8 mt-2 space-y-1 overflow-hidden"
                        style={{
                          animation: "fadeIn 0.3s ease-in-out",
                        }}
                      >
                        {item.children.map((child) => (
                          <NavLink
                            key={child.href}
                            to={child.href}
                            className={({ isActive }) =>
                              cn(
                                "flex items-center px-3 py-2 rounded-md text-sm",
                                "transition-all duration-200 text-right hover:translate-x-1",
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

                    {/* Popup menu for collapsed state */}
                    {isCollapsed && hoveredItem === item.title && (
                      <div
                        ref={el => {
                          if (el) {
                            const parent = el.parentElement?.querySelector('button');
                            if (parent) {
                              const rect = parent.getBoundingClientRect();
                              el.style.top = rect.top - 35 + 'px'; // رفع القائمة 16px فوق الزر
                            }
                          }
                        }}
                        className={cn(
                          "fixed w-48 bg-white rounded-lg shadow-xl z-50",
                          "py-1 border border-gray-200",
                          "animate-in fade-in slide-in-from-left-4"
                        )}
                        style={{ pointerEvents: 'auto' }}
                      >
                        <div className="px-3 py-2 text-xs font-medium text-gray-500 border-b border-gray-200">
                          {item.title}
                        </div>
                        {item.children.map((child) => (
                          <NavLink
                            key={child.href}
                            to={child.href}
                            className={({ isActive }) =>
                              cn(
                                "block px-4 py-2 text-sm text-right",
                                "transition-colors duration-150",
                                isActive
                                  ? "bg-blue-50 text-blue-600 font-medium"
                                  : "text-gray-700 hover:bg-gray-100"
                              )
                            }
                            onClick={() => setHoveredItem(null)}
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
                        "transition-all duration-200 text-right hover:translate-x-1",
                        isActive
                          ? "bg-blue-50 text-blue-600"
                          : "text-gray-600 hover:bg-gray-100",
                        isCollapsed && "justify-center",
                        isCollapsed && "hover:scale-105"
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
                  "transition-all duration-200 text-right hover:translate-x-1",
                  isActive
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-600 hover:bg-gray-100",
                  isCollapsed && "justify-center hover:scale-105"
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
                "transition-all duration-200 text-right text-red-600 hover:bg-red-50",
                "hover:translate-x-1",
                isCollapsed && "justify-center hover:scale-105"
              )}
            >
              <LogOut className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && <span>تسجيل الخروج</span>}
            </button>
          </div>
        </div>
      </div>

      {/* Add global animations */}
      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeInLeft {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-in.fade-in.slide-in-from-left-4 {
          animation: fadeInLeft 0.2s ease-out forwards;
        }
        .animate-in {
          animation: fadeIn 0.2s ease-out forwards;
        }
      `}</style>
    </>
  );
};

export default Sidebar;