import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts/AuthProvider";
import { SidebarProvider } from "@/contexts/SidebarContext";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
// import FloatingAvatarButton from "./components/FloatingAvatarButton";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import CustomersPage from "./pages/CustomersPage";
import FirebaseTestPage from "./pages/accounting/FirebaseTestPage";
import FirebaseDirectTest from "./pages/accounting/FirebaseDirectTest";


const queryClient = new QueryClient();

const App = () => (
  <AuthProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <SidebarProvider>
            <Routes>
              <Route path="/*" element={<Index />} />
              <Route path="/customers" element={<CustomersPage />} />
              <Route path="/firebase-test" element={<FirebaseTestPage />} />
              <Route path="/firebase-direct" element={<FirebaseDirectTest />} />
              
   
              
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          </SidebarProvider>
        </BrowserRouter>
       {/* <FloatingAvatarButton /> */}
      </TooltipProvider>
    </QueryClientProvider>
  </AuthProvider>
);

export default App;
