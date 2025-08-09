import { useState, useEffect, createContext, useContext } from 'react';
import { getActiveFinancialYears, FinancialYear } from '@/services/financialYearsService';
import { db } from '@/services/firebase';
import { getDocs, collection, query, updateDoc, doc } from 'firebase/firestore';
import dayjs, { Dayjs } from 'dayjs';

interface FinancialYearContextType {
  currentFinancialYear: FinancialYear | null;
  activeYears: FinancialYear[];
  setCurrentFinancialYear: (year: FinancialYear) => void;
  validateDate: (date: string | Dayjs) => boolean;
  getDateValidationMessage: (date: string | Dayjs) => string;
  getMinDate: () => string | null;
  getMaxDate: () => string | null;
  isWithinFinancialYear: (date: string | Dayjs) => boolean;
}

const FinancialYearContext = createContext<FinancialYearContextType | null>(null);

export const useFinancialYear = () => {
  const context = useContext(FinancialYearContext);
  if (!context) {
    throw new Error('useFinancialYear must be used within a FinancialYearProvider');
  }
  return context;
};

export const useFinancialYearHook = () => {
  const [currentFinancialYear, setCurrentFinancialYear] = useState<FinancialYear | null>(null);
  const [activeYears, setActiveYears] = useState<FinancialYear[]>([]);
  const [companyDocId, setCompanyDocId] = useState<string>('');

  // دالة لحفظ السنة المالية المختارة في قاعدة البيانات
  const saveFinancialYearToDatabase = async (year: FinancialYear) => {
    if (!companyDocId) return;
    
    try {
      await updateDoc(doc(db, 'companies', companyDocId), {
        fiscalYear: year.year.toString()
      });
      console.log('تم حفظ السنة المالية في قاعدة البيانات:', year.year);
    } catch (error) {
      console.error('خطأ في حفظ السنة المالية:', error);
    }
  };

  // دالة محدثة لتعيين السنة المالية مع الحفظ في قاعدة البيانات
  const setCurrentFinancialYearAndSave = async (year: FinancialYear) => {
    setCurrentFinancialYear(year);
    await saveFinancialYearToDatabase(year);
  };

  useEffect(() => {
    const initializeFinancialYear = async () => {
      try {
        // جلب السنوات المالية النشطة
        const years = await getActiveFinancialYears();
        console.log('السنوات المالية المجلبة من قاعدة البيانات:', years);
        setActiveYears(years.sort((a, b) => b.year - a.year));

        // جلب السنة المالية المختارة من الشركة
        const companyQuery = query(collection(db, "companies"));
        const companySnapshot = await getDocs(companyQuery);
        
        if (!companySnapshot.empty) {
          const companyDoc = companySnapshot.docs[0];
          const docData = companyDoc.data();
          setCompanyDocId(companyDoc.id); // حفظ معرف الوثيقة
          
          const savedFiscalYear = docData.fiscalYear;
          
          if (savedFiscalYear && years.length > 0) {
            const selectedYear = years.find(y => y.year.toString() === savedFiscalYear);
            if (selectedYear) {
              setCurrentFinancialYear(selectedYear);
            } else if (years.length > 0) {
              setCurrentFinancialYear(years[0]);
            }
          } else if (years.length > 0) {
            setCurrentFinancialYear(years[0]);
          }
        } else if (years.length > 0) {
          setCurrentFinancialYear(years[0]);
        }
      } catch (error) {
        console.error('خطأ في تهيئة السنة المالية:', error);
      }
    };

    initializeFinancialYear();
  }, []);

  const validateDate = (date: string | Dayjs): boolean => {
    if (!currentFinancialYear) return true; // إذا لم تكن هناك سنة مالية محددة، السماح بأي تاريخ
    
    const dateToValidate = typeof date === 'string' ? dayjs(date) : date;
    if (!dateToValidate.isValid()) return false;

    const startDate = dayjs(currentFinancialYear.startDate);
    const endDate = dayjs(currentFinancialYear.endDate);

    return dateToValidate.isSameOrAfter(startDate, 'day') && dateToValidate.isSameOrBefore(endDate, 'day');
  };

  const isWithinFinancialYear = (date: string | Dayjs): boolean => {
    return validateDate(date);
  };

  const getDateValidationMessage = (date: string | Dayjs): string => {
    if (!currentFinancialYear) return '';
    
    const dateToCheck = typeof date === 'string' ? dayjs(date) : date;
    if (!dateToCheck.isValid()) return 'تاريخ غير صحيح';

    const startDate = dayjs(currentFinancialYear.startDate);
    const endDate = dayjs(currentFinancialYear.endDate);

    if (dateToCheck.isBefore(startDate, 'day')) {
      return `التاريخ يجب أن يكون من ${startDate.format('YYYY-MM-DD')} أو بعده`;
    }
    
    if (dateToCheck.isAfter(endDate, 'day')) {
      return `التاريخ يجب أن يكون حتى ${endDate.format('YYYY-MM-DD')}`;
    }

    return '';
  };

  const getMinDate = (): string | null => {
    return currentFinancialYear ? currentFinancialYear.startDate : null;
  };

  const getMaxDate = (): string | null => {
    return currentFinancialYear ? currentFinancialYear.endDate : null;
  };

  return {
    currentFinancialYear,
    activeYears,
    setCurrentFinancialYear: setCurrentFinancialYearAndSave,
    validateDate,
    getDateValidationMessage,
    getMinDate,
    getMaxDate,
    isWithinFinancialYear
  };
};

export { FinancialYearContext };
export type { FinancialYearContextType };
