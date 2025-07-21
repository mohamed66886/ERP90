import { LogOut, Menu, X, Calendar, Search, Bell, User, Settings, HelpCircle, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/useAuth";
import { db } from "@/lib/firebase";
import { getDocs, collection, query, where } from "firebase/firestore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "next-themes";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";

interface HeaderProps {
  onLogout: () => void;
  onToggleSidebar?: () => void;
  isSidebarCollapsed?: boolean;
  companyName?: string;
  className?: string;
}

const Header = ({
  onLogout,
  onToggleSidebar,
  isSidebarCollapsed,
  companyName,
  className,
}: HeaderProps) => {
  const { user: userData } = useAuth();
  console.log('HEADER userData:', userData);
  const isDesktop = !useIsMobile();
  const [scrolled, setScrolled] = useState(false);
  const [fiscalYear, setFiscalYear] = useState<string>("");
  const [taxRate, setTaxRate] = useState<string>("");
  const [todayInvoices, setTodayInvoices] = useState<number>(0);
  const [unreadNotifications, setUnreadNotifications] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  // Company logo state
  const [logoUrl, setLogoUrl] = useState<string>("");

  useEffect(() => {
    const fetchLogo = async () => {
      try {
        const companyQuery = query(collection(db, "companies"));
        const companySnapshot = await getDocs(companyQuery);
        if (!companySnapshot.empty) {
          const docData = companySnapshot.docs[0].data();
          setLogoUrl(docData.logoUrl || "");
        }
      } catch (error) {
        console.error("Error fetching company logo:", error);
      }
    };
    fetchLogo();
  }, []);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch company settings
        const companyQuery = query(collection(db, "companies"));
        const companySnapshot = await getDocs(companyQuery);
        
        if (!companySnapshot.empty) {
          const docData = companySnapshot.docs[0].data();
          setFiscalYear(docData.fiscalYear || "");
          setTaxRate(docData.taxRate || "");
        }

        // Fetch today's invoices
        const today = new Date();
        const todayStr = today.toISOString().slice(0, 10);
        const invoicesQuery = query(
          collection(db, "sales_invoices"),
          where("date", ">=", todayStr)
        );
        const invoicesSnapshot = await getDocs(invoicesQuery);
        setTodayInvoices(invoicesSnapshot.size);

        // Fetch unread notifications
        const notificationsQuery = query(
          collection(db, "notifications"),
          where("read", "==", false)
        );
        const notificationsSnapshot = await getDocs(notificationsQuery);
        setUnreadNotifications(notificationsSnapshot.size);

      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Searching for:", searchQuery);
    if (!isDesktop) setShowMobileSearch(false);
  };

  const toggleMobileSearch = () => {
    setShowMobileSearch(!showMobileSearch);
    if (showMobileSearch && searchQuery) {
      handleSearch({ preventDefault: () => {} } as React.FormEvent);
    }
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-gray-200 transition-all duration-300 dark:bg-gray-900/95 dark:border-gray-800",
        scrolled ? "shadow-sm dark:shadow-gray-800/50" : "",
        className
      )}
    >
      <div className="container mx-auto px-2 sm:px-4">
        {/* Main Header Row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4 w-full py-3 sm:py-4">
          {/* Left Section - Logo and Menu */}
          <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto justify-between sm:justify-start">
            {/* Sidebar Toggle Button */}
            {onToggleSidebar && (
              <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onToggleSidebar}
                    className="hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors duration-200"
                    aria-label={isSidebarCollapsed ? "إظهار القائمة" : "إخفاء القائمة"}
                  >
                    {isSidebarCollapsed ? (
                      <Menu className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    ) : (
                      <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs font-medium">
                  {isSidebarCollapsed ? "إظهار القائمة" : "إخفاء القائمة"}
                </TooltipContent>
              </Tooltip>
            )}

            {/* Logo and Company Name */}
            <div className="flex items-center gap-3 flex-1 sm:flex-none">
              <Link to="/dashboard" className="flex items-center gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10rounded-lg flex items-center justify-center shadow-sm flex-shrink-0 dark:from-blue-800 dark:to-blue-900">
                  {theme === "dark" ? (
                    <img
                      src={logoUrl ? logoUrl.replace(/(\.png|\.jpg|\.jpeg)/, "-dark$1") : "/logo.png"}
                      alt="شعار الشركة"
                      width={120}
                      
                      height={64}
                      className="object-contain rounded-md"
                      loading="eager"
                    />
                  ) : (
                    <img
                      src={logoUrl || "/logo.png"}
                      alt="شعار الشركة"
                      width={80}
                      height={64}
                      className="object-contain rounded-md"
                      loading="eager"
                    />
                  )}
                </div>
                <div className="flex flex-col justify-center">
                  <h1 className="font-bold text-gray-900 dark:text-white text-right text-base sm:text-lg leading-tight">
                    نظام | ERP90
                  </h1>
                  {companyName && (
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 text-right truncate max-w-[120px] sm:max-w-[200px]">
                      {companyName}
                    </p>
                  )}
                </div>
              </Link>
            </div>
            
            {/* Mobile Actions */}
            {!isDesktop && (
              <div className="flex items-center gap-2">
                {/* Search Toggle Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                  onClick={toggleMobileSearch}
                >
                  <Search className="h-5 w-5" />
                </Button>
                
                {/* User Avatar */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="h-10 w-10 p-0 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={userData?.avatar} alt="صورة المستخدم" />
                        <AvatarFallback className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300">
                          {userData?.name
                            ?.split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end">
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {userData?.name || "مستخدم"}
                        </p>
                        <p className="text-xs leading-none text-gray-500 dark:text-gray-400">
                          {userData?.email || "بريد إلكتروني"}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/profile" className="w-full">
                        <User className="mr-2 h-4 w-4" />
                        الملف الشخصي
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/settings" className="w-full">
                        <Settings className="mr-2 h-4 w-4" />
                        الإعدادات
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={onLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      تسجيل الخروج
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>

          {/* Middle Section - Search (Desktop) */}
          {isDesktop && (
            <div className="flex-1 max-w-xl mx-4">
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                  <Input
                    type="search"
                    placeholder="ابحث في الفواتير، العملاء، المنتجات..."
                    className="w-full pr-10 pl-4 py-2"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </form>
            </div>
          )}

          {/* Right Section - User and Actions */}
          <div className={`hidden sm:flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-between sm:justify-end ${showMobileSearch ? '!flex' : ''}`}>
            {/* Financial Information */}
            {isDesktop && !isLoading && fiscalYear && (
              <div className="hidden md:flex flex-col items-start gap-2">
                <div className="flex items-center divide-x divide-gray-300 dark:divide-gray-700">
                  {/* Fiscal Year */}
                  <div className="px-3 flex items-center gap-2 text-gray-700 dark:text-gray-300 text-sm">
                    <Calendar className="h-4 w-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                    <span className="whitespace-nowrap">السنة: {fiscalYear}</span>
                  </div>
                  {/* Tax Rate */}
                  {taxRate && (
                    <div className="px-3 flex items-center gap-1 text-gray-700 dark:text-gray-300 text-sm">
                      <span>الضريبة:</span>
                      <span className="font-medium">{taxRate}%</span>
                    </div>
                  )}
                  {/* Today's Invoices */}
                  <div className="px-3 flex items-center gap-1 text-gray-700 dark:text-gray-300 text-sm">
                    <span>فواتير اليوم:</span>
                    <span className="font-medium">{todayInvoices}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Loading Skeletons */}
            {isLoading && isDesktop && (
              <div className="hidden md:flex items-center gap-4">
                <Skeleton className="h-6 w-24 rounded-md" />
                <Skeleton className="h-6 w-16 rounded-md" />
                <Skeleton className="h-6 w-20 rounded-md" />
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Theme Toggle */}
              <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  >
                    {mounted ? (
                      theme === "dark" ? (
                        <Sun className="h-5 w-5" />
                      ) : (
                        <Moon className="h-5 w-5" />
                      )
                    ) : (
                      <Sun className="h-5 w-5" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs font-medium">
                  {mounted && theme === "dark" ? "الوضع المضيء" : "الوضع المظلم"}
                </TooltipContent>
              </Tooltip>

              {/* Notifications */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 relative"
                  >
                    <Bell className="h-5 w-5" />
                    {unreadNotifications > 0 && (
                      <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0">
                        {unreadNotifications > 9 ? "9+" : unreadNotifications}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-80 p-0" align="end">
                  <DropdownMenuLabel className="flex justify-between items-center px-4 py-3">
                    <span>الإشعارات</span>
                    <Button variant="link" size="sm" className="h-6 text-sm">
                      تعيين الكل كمقروء
                    </Button>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
                    {unreadNotifications > 0
                      ? `لديك ${unreadNotifications} إشعارات غير مقروءة`
                      : "لا توجد إشعارات جديدة"}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Help */}
              <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                    asChild
                  >
                    <Link to="/help">
                      <HelpCircle className="h-5 w-5" />
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs font-medium">
                  المساعدة والدعم
                </TooltipContent>
              </Tooltip>

              {/* User Avatar (Desktop) */}
              {isDesktop && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="h-10 w-10 p-0 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={userData?.avatar} alt="صورة المستخدم" />
                        <AvatarFallback className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300">
                          {userData?.name
                            ?.split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end">
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {userData?.name || "مستخدم"}
                        </p>
                        <p className="text-xs leading-none text-gray-500 dark:text-gray-400">
                          {userData?.email || "بريد إلكتروني"}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/profile" className="w-full">
                        <User className="mr-2 h-4 w-4" />
                        الملف الشخصي
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/settings" className="w-full">
                        <Settings className="mr-2 h-4 w-4" />
                        الإعدادات
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={onLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      تسجيل الخروج
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Search Bar (shown when activated) */}
        {!isDesktop && showMobileSearch && (
          <div className="pb-3 px-2">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                <Input
                  type="search"
                  placeholder="ابحث في النظام..."
                  className="w-full pr-10 pl-4 py-2"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                />
              </div>
            </form>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;