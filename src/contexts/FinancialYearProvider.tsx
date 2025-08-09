import React, { createContext, ReactNode } from 'react';
import { useFinancialYearHook, FinancialYearContext, FinancialYearContextType } from '@/hooks/useFinancialYear';

interface FinancialYearProviderProps {
  children: ReactNode;
}

export const FinancialYearProvider: React.FC<FinancialYearProviderProps> = ({ children }) => {
  const financialYearData = useFinancialYearHook();

  return (
    <FinancialYearContext.Provider value={financialYearData}>
      {children}
    </FinancialYearContext.Provider>
  );
};

export default FinancialYearProvider;
