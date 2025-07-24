import { useState, useEffect } from "react";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import LoginPage from "@/components/LoginPage";
import DataCompletionPage from "@/components/DataCompletionPage";
import Dashboard from "@/components/Dashboard";
import ProfessionalLoader from "@/components/ProfessionalLoader";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import ProfilePage from "./ProfilePage";
import Header from "@/components/Header";
import Managers from "./admin/admins";
import PurchasesPage from "./stores/purchases";
import HelpPage from "./help";
import { Routes, Route } from "react-router-dom";
import DailySales from "./reports/daily-sales";
import PurchasesReturnPage from "./stores/purchases-return";
import Stockpage from "./stores/stock";
import InvoiceProfitsReport from "./reports/invoice-profits";
import Footer from "@/components/Footer";


import InvoicePreferred from "./reports/invoice-preferred";
import SettingsPage from "./SettingsPage";
import ItemCardPage from "./stores/item";
import SalesPage from "./stores/sales";
import WarehouseManagement from "./stores/manage";
import SalesReturnPage from "./stores/sales-return";
import Branches from "./business/branches";
import PaymentMethodsPage from "./business/payment-methods";
import Suppliers from "./suppliers";
import NotFound from "./NotFound";
import { useAuth } from "@/contexts/useAuth";
type AppState = "login" | "data-completion" | "dashboard";



const Index = () => {
  const { user, loading } = useAuth();
  const [appState, setAppState] = useState<AppState>("login");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [companyData, setCompanyData] = useState<any>(null);
  const [companyLoading, setCompanyLoading] = useState(true);

  // عند أول تحميل الصفحة، جلب بيانات الشركة من قاعدة البيانات
  useEffect(() => {
    const fetchCompany = async () => {
      setCompanyLoading(true);
      const q = collection(db, "companies");
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        setCompanyData(snapshot.docs[0].data());
        setAppState("dashboard");
      }
      setCompanyLoading(false);
    };
    fetchCompany();
  }, []);


  const handleLogin = () => {
    if (companyData) {
      setAppState("dashboard");
    } else {
      setAppState("data-completion");
    }
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


  if (loading || companyLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-700 via-indigo-600 to-blue-500">
        <div className="flex flex-col items-center space-y-6">
          <div className="animate-spin rounded-full border-8 border-t-8 border-t-white border-white/30 h-24 w-24 mb-4" />
          <h2 className="text-2xl font-bold text-white drop-shadow-lg">جاري تحميل بياناتك...</h2>
          <p className="text-white/80">يرجى الانتظار قليلاً حتى يتم تجهيز النظام</p>
        </div>
      </div>
    );
  }

  // إذا لم يوجد مستخدم، اعرض صفحة تسجيل الدخول
  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  if (appState === "data-completion" && !companyData) {
    return <DataCompletionPage onComplete={data => handleDataCompletion(data)} />;
  }

  // بعد تسجيل الدخول وإتمام البيانات، استخدم الراوتر
  return (
    <div className="bg-background rtl" dir="rtl">
      {/* الهيدر بعرض الشاشة بالكامل */}
      <Header
        onLogout={handleLogout}
        onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
        isSidebarCollapsed={sidebarCollapsed}
        companyName={companyData?.arabicName}
      />
      {/* صف فيه السايدبار بجانب المحتوى الرئيسي */}
    <div className="flex">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-y-auto min-h-screen">
        <main className="flex-1">
          <Routes>
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/stores/item" element={<ItemCardPage />} />
            <Route path="/stores/sales" element={<SalesPage />} />
            <Route path="/stores/manage" element={<WarehouseManagement />} />
            <Route path="/stores/sales-return" element={<SalesReturnPage />} />
            <Route path="/business/branches" element={<Branches />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/stores/stock" element={<Stockpage />} />
            <Route path="/stores/purchases" element={<PurchasesPage />} />
            <Route path="/reports/invoice-profits" element={<InvoiceProfitsReport />} />
            <Route path="/reports/invoice-preferred" element={<InvoicePreferred />} />
            <Route path="/stores/purchases-return" element={<PurchasesReturnPage />} />
            <Route path="/help" element={<HelpPage />} />
            <Route path="/admin/admins" element={<Managers />} />
            <Route path="/business/payment-methods" element={<PaymentMethodsPage />} />
            <Route path="/reports/daily-sales" element={<DailySales />} />
            <Route path="/suppliers" element={<Suppliers />} />
            <Route path="/" element={<Dashboard />} />

          {/* Catch-all route for 404 */}
          <Route path="*" element={<NotFound />} />

          </Routes>
        </main>
        <Footer />
      </div>
    </div>
  </div>
  );
};

export default Index;
