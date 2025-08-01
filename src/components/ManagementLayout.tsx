import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/useAuth';

interface ManagementLayoutProps {
  children: ReactNode;
}

const ManagementLayout = ({ children }: ManagementLayoutProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

  const handleLogout = async () => {
    navigate('/');
  };

  return (
    <div className="bg-background rtl" dir="rtl">
      {/* الهيدر */}
      <Header
        onLogout={handleLogout}
        onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
        isSidebarCollapsed={sidebarCollapsed}
        companyName="ERP90"
      />
      
      {/* التخطيط الرئيسي */}
      <div className="flex">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-y-auto min-h-screen">
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default ManagementLayout;
