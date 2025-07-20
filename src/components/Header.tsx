import { LogOut, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface HeaderProps {
  onLogout: () => void;
  onToggleSidebar?: () => void;
  isSidebarCollapsed?: boolean;
  companyName?: string;
  commercialRegistration?: string;
  activityType?: string;
  mobile?: string;
  className?: string;
}

const Header = ({
  onLogout,
  onToggleSidebar,
  isSidebarCollapsed,
  companyName,
  commercialRegistration,
  activityType,
  mobile,
  className,
}: HeaderProps) => {
  const isDesktop = !useIsMobile();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 h-16 bg-card/95 backdrop-blur-xl supports-[backdrop-filter]:bg-card/80 border-b border-border/50 transition-all duration-300",
        scrolled ? "shadow-sm" : "",
        className
      )}
    >
      <div className="container mx-auto px-4 sm:px-6 h-full">
        <div className="flex items-center justify-between h-full">
          {/* Left section */}
          <div className="flex items-center gap-3 overflow-hidden">
            {/* Sidebar toggle button */}
            {onToggleSidebar && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onToggleSidebar}
                    className="mr-1 hover:bg-primary/10"
                    aria-label={isSidebarCollapsed ? "فتح القائمة الجانبية" : "إغلاق القائمة الجانبية"}
                  >
                    {isSidebarCollapsed ? <Menu className="w-5 h-5" /> : <X className="w-5 h-5" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="font-arabic">
                  {isSidebarCollapsed ? "إظهار القائمة" : "إخفاء القائمة"}
                </TooltipContent>
              </Tooltip>
            )}

            {/* Logo */}
            <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-primary to-primary/90 rounded-lg flex items-center justify-center shadow-sm border border-primary/20">
              <img
                src="/logo.png"
                alt="شعار الشركة"
                className="w-6 h-6 object-contain"
                loading="eager"
                width={24}
                height={24}
              />
            </div>

            {/* Company info */}
            <div className="flex flex-col min-w-0">
              <h1 className="font-bold text-lg font-arabic truncate text-primary">نظام المحاسبة</h1>
              {companyName && (
                <p className="text-xs text-foreground/80 dark:text-foreground/70 font-arabic font-medium truncate">
                  {companyName}
                </p>
              )}
              {(commercialRegistration || activityType || mobile) && (
                <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-0.5">
                  {commercialRegistration && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="text-xs text-muted-foreground font-arabic truncate max-w-[120px]">
                          س.ت: {commercialRegistration}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="font-arabic">
                        السجل التجاري: {commercialRegistration}
                      </TooltipContent>
                    </Tooltip>
                  )}
                  {activityType && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="text-xs text-muted-foreground font-arabic truncate max-w-[120px]">
                          النشاط: {activityType}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="font-arabic">
                        نوع النشاط: {activityType}
                      </TooltipContent>
                    </Tooltip>
                  )}
                  {mobile && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="text-xs text-muted-foreground font-arabic truncate max-w-[120px]">
                          جوال: {mobile}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="font-arabic">
                        رقم الجوال: {mobile}
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right section */}
          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size={isDesktop ? "sm" : "icon"}
                  onClick={onLogout}
                  className="flex-shrink-0 flex items-center gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive transition-colors group"
                  aria-label="تسجيل الخروج"
                >
                  <LogOut className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:scale-110" />
                  {isDesktop && (
                    <span className="font-medium font-arabic">تسجيل الخروج</span>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="font-arabic">
                تسجيل الخروج من النظام
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;