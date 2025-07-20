import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Calculator,
  BarChart3,
  FileText,
  Users,
  Settings,
  Receipt,
  PieChart,
  CreditCard,
  Building,
  LogOut,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  Warehouse,
  ClipboardList,
  Package,
  ShoppingCart,
  Undo2,
  DollarSign,
  Undo,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  onLogout: () => void;
  customersCount?: number;
}

const getMenuItems = (customersCount?: number) => [
  {
    title: "لوحة التحكم",
    icon: BarChart3,
    href: "/",
    badge: null,
  },
  {
    title: "ادارة الأعمال",
    icon: ClipboardList,
    children: [
      { title: "ادارة الفروع", href: "/business/branches" },
      { title: "طرق الدفع", href: "/business/payment-methods" },
    ],
  },
  // {
  //   title: "المحاسبة",
  //   icon: Calculator,
  //   children: [
  //     { title: "القيود المحاسبية", href: "/accounting/entries" },
  //     { title: "دليل الحسابات", href: "/accounting/chart" },
  //     { title: "الميزان العمومي", href: "/accounting/trial-balance" },
  //   ],
  // },
  {
    title: "الفواتير",
    icon: Receipt,
    children: [
      { title: "فواتير المبيعات", href: "/stores/sales" },
      // { title: "فواتير المشتريات", href: "/invoices/purchases" },
      // { title: "عروض الأسعار", href: "/invoices/quotes" },
    ],
  },
  {
    title: "المخازن",
    icon: BarChart3, // يمكنك تغيير الأيقونة لاحقاً إذا أردت أيقونة مختلفة
    children: [
      { title: "ادارة المخازن", href: "/stores/manage", icon: Warehouse },
      { title: "الصنف", href: "/stores/item", icon: Package },
      // { title: "مرتجع المشتريات", href: "/stores/purchase-returns", icon: Undo2 },
      // { title: "مرتجع المبيعات", href: "/stores/sales-returns", icon: Undo },
    ],
  },
  {
    title: "العملاء",
    icon: Users,
    href: "/customers",
    badge: customersCount !== undefined ? String(customersCount) : undefined,
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
  // {
  //   title: "التقارير",
  //   icon: FileText,
  //   children: [
  //     { title: "قائمة الدخل", href: "/reports/income" },
  //     { title: "الميزانية العمومية", href: "/reports/balance" },
  //     { title: "التدفق النقدي", href: "/reports/cashflow" },
  //     { title: "تقرير الأرباح", href: "/reports/profit" },
  //   ],
  // },
  // {
  //   title: "الإحصائيات",
  //   icon: PieChart,
  //   href: "/analytics",
  // },
  // {
  //   title: "المدفوعات",
  //   icon: CreditCard,
  //   href: "/payments",
  // },
];

const Sidebar = ({
  isCollapsed,
  onToggle,
  onLogout,
  customersCount,
}: SidebarProps) => {
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const menuItems = getMenuItems(customersCount);

  const toggleExpanded = (title: string) => {
    setExpandedItems((prev) =>
      prev.includes(title)
        ? prev.filter((item) => item !== title)
        : [...prev, title]
    );
  };

  const isActive = (href: string) => location.pathname === href;
  const hasActiveChild = (children: any[]) =>
    children?.some((child) => isActive(child.href));

  return (
    <>
      {/* Mobile overlay */}
      {!isCollapsed && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed right-0 top-0 h-screen bg-card border-l border-border z-50 transition-all duration-300 lg:relative lg:z-auto",
          isCollapsed ? "w-0 lg:w-16" : "w-80 lg:w-64",
          "overflow-hidden shadow-lg"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between">
              {!isCollapsed && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                    <Calculator className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h2 className="font-bold text-lg font-arabic">المحاسبة</h2>
                    <p className="text-sm text-muted-foreground font-arabic">
                      الإصدار الاحترافي
                    </p>
                  </div>
                </div>
              )}

              <Button
                variant="ghost"
                size="sm"
                onClick={onToggle}
                className="lg:hidden"
              >
                {isCollapsed ? (
                  <Menu className="w-5 h-5" />
                ) : (
                  <X className="w-5 h-5" />
                )}
              </Button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {menuItems.map((item) => (
              <div key={item.title}>
                {item.children ? (
                  // Menu item with children
                  <div>
                    <button
                      onClick={() => toggleExpanded(item.title)}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors font-arabic",
                        hasActiveChild(item.children)
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted",
                        isCollapsed && "justify-center"
                      )}
                    >
                      <item.icon className="w-5 h-5 flex-shrink-0" />
                      {!isCollapsed && (
                        <>
                          <span className="flex-1 text-right">
                            {item.title}
                          </span>
                          {expandedItems.includes(item.title) ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </>
                      )}
                    </button>

                    {/* Submenu */}
                    {!isCollapsed && expandedItems.includes(item.title) && (
                      <div className="mr-8 mt-2 space-y-1">
                        {item.children.map((child) => (
                          <NavLink
                            key={child.href}
                            to={child.href}
                            className={({ isActive }) =>
                              cn(
                                "flex items-center px-3 py-2 rounded-md text-sm transition-colors font-arabic",
                                isActive
                                  ? "bg-primary/10 text-primary font-medium"
                                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                              )
                            }
                          >
                        <>
                          {child.icon && <child.icon className="w-4 h-4 ml-2" />}
                          {child.title}
                        </>
                          </NavLink>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  // Simple menu item
                  <NavLink
                    to={item.href!}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors font-arabic",
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted",
                        isCollapsed && "justify-center"
                      )
                    }
                  >
                    <item.icon className="w-5 h-5 flex-shrink-0" />
                    {!isCollapsed && (
                      <div className="flex items-center justify-between w-full">
                        <span>{item.title}</span>
                        {item.badge && (
                          <span className="bg-accent text-accent-foreground px-2 py-0.5 rounded-full text-xs font-medium">
                            {item.badge}
                          </span>
                        )}
                      </div>
                    )}
                  </NavLink>
                )}
              </div>
            ))}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-border space-y-2">
            <NavLink
              to="/settings"
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors font-arabic",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted",
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
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors font-arabic",
                "text-destructive hover:bg-destructive/10",
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