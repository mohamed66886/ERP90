import React, { createContext, useState, ReactNode } from 'react';

export type SectionType = 
  | 'default'
  | 'financial'
  | 'hr'
  | 'warehouse'
  | 'projects'
  | 'sales'
  | 'purchase'
  | 'contracts'
  | 'equipment';

interface SidebarContextType {
  currentSection: SectionType;
  setCurrentSection: (section: SectionType) => void;
}

export const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

interface SidebarProviderProps {
  children: ReactNode;
}

export const SidebarProvider: React.FC<SidebarProviderProps> = ({ children }) => {
  const [currentSection, setCurrentSection] = useState<SectionType>('default');

  return (
    <SidebarContext.Provider value={{ currentSection, setCurrentSection }}>
      {children}
    </SidebarContext.Provider>
  );
};
