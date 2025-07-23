import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Receipt, 
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  FileText,
  Calculator
} from "lucide-react";

const Dashboard = () => {
  const stats = [
    {
      title: "إجمالي الإيرادات",
      value: "245,850",
      currency: "ر.س",
      change: "+12.5%",
      trend: "up",
      icon: DollarSign,
      color: "text-green-600"
    },
    {
      title: "إجمالي المصروفات",
      value: "125,430",
      currency: "ر.س",
      change: "-3.2%",
      trend: "down",
      icon: TrendingDown,
      color: "text-red-600"
    },
    {
      title: "صافي الربح",
      value: "120,420",
      currency: "ر.س",
      change: "+18.7%",
      trend: "up",
      icon: TrendingUp,
      color: "text-green-600"
    },
    {
      title: "العملاء النشطين",
      value: "127",
      currency: "",
      change: "+5",
      trend: "up",
      icon: Users,
      color: "text-blue-600"
    }
  ];

  const recentTransactions = [
    { id: 1, type: "إيراد", description: "فاتورة مبيعات #2024-001", amount: "+15,500", date: "اليوم" },
    { id: 2, type: "مصروف", description: "فاتورة كهرباء", amount: "-2,350", date: "أمس" },
    { id: 3, type: "إيراد", description: "دفعة من العميل أحمد محمد", amount: "+8,750", date: "أمس" },
    { id: 4, type: "مصروف", description: "راتب موظف", amount: "-12,000", date: "منذ يومين" },
    { id: 5, type: "إيراد", description: "فاتورة خدمات #2024-002", amount: "+22,100", date: "منذ يومين" }
  ];

  const quickActions = [
    { title: "فاتورة جديدة", icon: Receipt, color: "bg-blue-500" },
    { title: "قيد محاسبي", icon: Calculator, color: "bg-green-500" },
    { title: "عميل جديد", icon: Users, color: "bg-purple-500" },
    { title: "تقرير مالي", icon: FileText, color: "bg-orange-500" }
  ];

  return (
    <div className="space-y-6 rtl" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary font-arabic">لوحة التحكم</h1>
          <p className="text-muted-foreground font-arabic mt-1">
            مرحباً بك، إليك ملخص نشاط شركتك اليوم
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="font-arabic">
            <Calendar className="w-4 h-4 ml-2" />
            هذا الشهر
          </Button>
          <Button className="bg-gradient-primary hover-glow font-arabic">
            <Plus className="w-4 h-4 ml-2" />
            إضافة جديد
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="hover-glow fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground font-arabic mb-1">
                    {stat.title}
                  </p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-2xl font-bold font-arabic">
                      {stat.value}
                    </p>
                    {stat.currency && (
                      <span className="text-sm text-muted-foreground font-arabic">
                        {stat.currency}
                      </span>
                    )}
                  </div>
                  <div className={`flex items-center gap-1 mt-2 ${stat.color}`}>
                    {stat.trend === "up" ? (
                      <ArrowUpRight className="w-4 h-4" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4" />
                    )}
                    <span className="text-sm font-medium">{stat.change}</span>
                  </div>
                </div>
                <div className={`p-3 rounded-full bg-gradient-secondary ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions */}
        <Card className="lg:col-span-2 hover-glow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-arabic">
              <BarChart3 className="w-5 h-5" />
              آخر المعاملات
            </CardTitle>
            <CardDescription className="font-arabic">
              المعاملات المالية الأخيرة لشركتك
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      transaction.type === "إيراد" ? "bg-green-500" : "bg-red-500"
                    }`} />
                    <div>
                      <p className="font-medium font-arabic text-sm">{transaction.description}</p>
                      <p className="text-xs text-muted-foreground font-arabic">{transaction.date}</p>
                    </div>
                  </div>
                  <div className={`font-semibold font-arabic ${
                    transaction.amount.startsWith("+") ? "text-green-600" : "text-red-600"
                  }`}>
                    {transaction.amount} ر.س
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4 font-arabic">
              عرض جميع المعاملات
            </Button>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="hover-glow">
          <CardHeader>
            <CardTitle className="font-arabic">إجراءات سريعة</CardTitle>
            <CardDescription className="font-arabic">
              الإجراءات الأكثر استخداماً
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="h-20 flex-col gap-2 hover-glow font-arabic"
                >
                  <div className={`w-8 h-8 rounded-lg ${action.color} flex items-center justify-center`}>
                    <action.icon className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-xs">{action.title}</span>
                </Button>
              ))}
            </div>
            
            <div className="mt-6 p-4 bg-gradient-secondary rounded-lg">
              <h4 className="font-semibold text-primary font-arabic mb-2">نصائح اليوم</h4>
              <p className="text-sm text-muted-foreground font-arabic">
                تذكر مراجعة التقارير المالية الشهرية لضمان دقة البيانات المحاسبية
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;