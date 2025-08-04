import { useContext, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { SidebarContext } from '../contexts/SidebarContext';
import { getSectionFromPath } from '../utils/sidebarMenus';

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
};

// Hook مساعد لتحديث القسم تلقائياً بناءً على الصفحة الحالية
export const useAutoSectionUpdate = () => {
  const { setCurrentSection } = useSidebar();
  const location = useLocation();

  useEffect(() => {
    const section = getSectionFromPath(location.pathname);
    if (section !== 'default') {
      setCurrentSection(section);
    }
  }, [location.pathname, setCurrentSection]);
};
