import { useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import LoginPage from "@/components/LoginPage";
import DataCompletionPage from "@/components/DataCompletionPage";
import Dashboard from "@/components/Dashboard";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import Header from "@/components/Header";
import Managers from "./admin/admins";
import { Routes, Route } from "react-router-dom";


import SettingsPage from "./SettingsPage";
import ItemCardPage from "./stores/item";
import SalesPage from "./stores/sales";
import WarehouseManagement from "./stores/manage";
import Branches from "./business/branches";
import PaymentMethodsPage from "./business/payment-methods";
import Suppliers from "./suppliers";
type AppState = "login" | "data-completion" | "dashboard";



const Index = () => {
  const [appState, setAppState] = useState<AppState>("login");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [companyData, setCompanyData] = useState<any>(null);

  const handleLogin = () => {
    setAppState("data-completion");
  };

  // استقبل بيانات الشركة من DataCompletionPage
  const handleDataCompletion = (data?: any) => {
    if (data) setCompanyData(data);
    setAppState("dashboard");
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      // يمكن عرض رسالة خطأ إذا رغبت
    }
    setAppState("login");
    setSidebarCollapsed(false);
    setCompanyData(null);
  };

  if (appState === "login") {
    return <LoginPage onLogin={handleLogin} />;
  }

  if (appState === "data-completion") {
    return <DataCompletionPage onComplete={data => handleDataCompletion(data)} />;
  }

  // بعد تسجيل الدخول وإتمام البيانات، استخدم الراوتر
  return (
    <div className="min-h-screen bg-background rtl" dir="rtl">
      <div className="flex">
        <Sidebar 
          isCollapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          onLogout={handleLogout}
        />
        <div className="flex-1 flex flex-col h-screen overflow-y-auto">
          {/* Top bar */}
          <Header
            onLogout={handleLogout}
            onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
            isSidebarCollapsed={sidebarCollapsed}
            companyName={companyData?.arabicName}
            commercialRegistration={companyData?.commercialRegistration}
            activityType={companyData?.activityType}
            mobile={companyData?.mobile}
          />
          {/* Main content */}
          <main className="flex-1 p-6 lg:p-8">
            <Routes>
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/stores/item" element={<ItemCardPage />} />
              <Route path="/stores/sales" element={<SalesPage />} />
              <Route path="/stores/manage" element={<WarehouseManagement />} />
              <Route path="/business/branches" element={<Branches />} />
              <Route path="/admin/admins" element={<Managers />} />
              <Route path="/business/payment-methods" element={<PaymentMethodsPage />} />
              <Route path="/suppliers" element={<Suppliers />} />

              <Route path="*" element={<Dashboard />} />
            </Routes>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Index;
