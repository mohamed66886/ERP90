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
import EditSalesPage from "./edit/editsales";
import EditReturnPage from "./edit/edit-return";
import Stockpage from "./stores/stock";
import InvoiceProfitsReport from "./reports/invoice-profits";
import Footer from "@/components/Footer";


import InvoicePreferred from "./reports/invoice-preferred";
import Invoice from "./reports/invoice";
import SettingsPage from "./SettingsPage";
import ItemCardPage from "./stores/item";
import SalesPage from "./stores/sales";
import WarehouseManagementOld from "./stores/manage";
import SalesReturnPage from "./stores/sales-return";
import Branches from "./business/branches";
import PaymentMethodsPage from "./business/payment-methods";
import Suppliers from "./suppliers";
import NotFound from "./NotFound";
import { useAuth } from "@/contexts/useAuth";
import SalesRepresentativesManagement from "./management/SalesRepresentativesManagement";
import SalesTargetsPage from "./management/SalesTargetsPage";
import SalesCommissionsPage from "./management/SalesCommissionsPage";
import PerformanceEvaluationPage from "./management/PerformanceEvaluationPage";
import {
  FinancialManagement,
  HumanResources,
  WarehouseManagement,
  ProjectManagement,
  SalesManagement,
  PurchaseManagement,
  // ContractManagement,
  EquipmentManagement
} from "../pages/management";

// Accounting Pages
import AccountsSettlementPage from "./accounting/AccountsSettlementPage";
import AddAccountPage from "./accounting/AddAccountPage";
import EditAccountPage from "./accounting/EditAccountPage";
import ChartOfAccountsPage from "./accounting/ChartOfAccountsPage";
import FinancialYearsPage from "./accounting/FinancialYearsPage";
import BankAccountsPage from "./accounting/BankAccountsPage";
import CashBoxesPage from "./management/CashBoxesPage";

// Customer Management Pages
import AddCustomerPage from "./customers/AddCustomerPage";
import CustomersDirectoryPage from "./customers/CustomersDirectoryPage";
import EditCustomerPage from "./customers/EditCustomerPage";
import ViewCustomerPage from "./customers/ViewCustomerPage";
import CustomerStatusPage from "./customers/CustomerStatusPage";
import CustomerClassificationPage from "./customers/CustomerClassificationPage";
import CustomerFollowUpPage from "./customers/CustomerFollowUpPage";
import SalesRepresentativesPage from "./management/SalesRepresentativesPageFixed";
import EditSalesInvoicePage from "./stores/edit-sales-invoice";
import EditSalesInvoiceDetailPage from "./stores/edit-sales-invoice-detail";
import ReceiptVoucher from "./stores/ReceiptVoucher";
type AppState = "login" | "data-completion" | "dashboard";

interface CompanyData {
  arabicName?: string;
  englishName?: string;
  [key: string]: unknown;
}

const Index = () => {
  const { user, loading } = useAuth();
  const [appState, setAppState] = useState<AppState>("login");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [companyData, setCompanyData] = useState<CompanyData | null>(null);
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
  const handleDataCompletion = (data?: CompanyData) => {
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
            <Route path="/stores/manage" element={<WarehouseManagementOld />} />
            <Route path="/stores/sales-return" element={<SalesReturnPage />} />
            <Route path="/stores/edit-sales-invoice" element={<EditSalesInvoicePage />} />
            <Route path="/stores/edit-sales-invoice/:id" element={<EditSalesInvoiceDetailPage />} />
            <Route path="/stores/receipt-voucher" element={<ReceiptVoucher />} />
            <Route path="/business/branches" element={<Branches />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/stores/stock" element={<Stockpage />} />
            <Route path="/stores/purchases" element={<PurchasesPage />} />
            <Route path="/reports/invoice-profits" element={<InvoiceProfitsReport />} />
            <Route path="/reports/invoice-preferred" element={<InvoicePreferred />} />
            <Route path="/stores/purchases-return" element={<PurchasesReturnPage />} />
            <Route path="/edit/editsales" element={<EditSalesPage />} />
            <Route path="/edit/edit-return/:id" element={<EditReturnPage />} />
            <Route path="/help" element={<HelpPage />} />
            <Route path="/admin/admins" element={<Managers />} />
            <Route path="/business/payment-methods" element={<PaymentMethodsPage />} />
            <Route path="/reports/daily-sales" element={<DailySales />} />
           <Route path="/reports/invoice" element={<Invoice />} />
           {/* Management Routes */}
            <Route path="/management/financial" element={<FinancialManagement />} />
            <Route path="/management/hr" element={<HumanResources />} />
            <Route path="/management/warehouse" element={<WarehouseManagement />} />
            <Route path="/management/projects" element={<ProjectManagement />} />
            <Route path="/management/sales" element={<SalesManagement />} />
            <Route path="/management/sales-representatives" element={<SalesRepresentativesPage />} />
            <Route path="/management/sales-targets" element={<SalesTargetsPage />} />
            <Route path="/management/sales-commissions" element={<SalesCommissionsPage />} />
            <Route path="/management/performance-evaluation" element={<PerformanceEvaluationPage />} />
            <Route path="/management/purchase" element={<PurchaseManagement />} />
            {/* <Route path="/management/contracts" element={<ContractManagement />} /> */}
            <Route path="/management/equipment" element={<EquipmentManagement />} />
            
            {/* Financial Management Sub-Routes */}
            <Route path="/accounting/accounts-settlement" element={<AccountsSettlementPage />} />
            <Route path="/accounting/add-account" element={<AddAccountPage />} />
            <Route path="/accounting/edit-account/:id" element={<EditAccountPage />} />
            <Route path="/accounting/chart-of-accounts" element={<ChartOfAccountsPage />} />
            <Route path="/accounting/financial-years" element={<FinancialYearsPage />} />
            <Route path="/accounting/bank-accounts" element={<BankAccountsPage />} />
            <Route path="/accounting/cash-boxes" element={<CashBoxesPage />} />
            
            {/* Customer Management Routes */}
            <Route path="/customers/add" element={<AddCustomerPage />} />
            <Route path="/customers/directory" element={<CustomersDirectoryPage />} />
            <Route path="/customers/edit/:customerId" element={<EditCustomerPage />} />
            <Route path="/customers/view/:customerId" element={<ViewCustomerPage />} />
            <Route path="/customers/status" element={<CustomerStatusPage />} />
            <Route path="/customers/classification" element={<CustomerClassificationPage />} />
            <Route path="/customers/follow-up" element={<CustomerFollowUpPage />} />
            
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
