// تحويل الأرقام إلى كلمات باللغة العربية مع دعم عملات مختلفة
export const numberToArabicWords = (num: number, currency: string = 'EGP'): string => {
  if (isNaN(num) || num < 0) return '';
  if (num === 0) return 'صفر';

  const ones = [
    '', 'واحد', 'اثنان', 'ثلاثة', 'أربعة', 'خمسة', 'ستة', 'سبعة', 'ثمانية', 'تسعة',
    'عشرة', 'أحد عشر', 'اثنا عشر', 'ثلاثة عشر', 'أربعة عشر', 'خمسة عشر',
    'ستة عشر', 'سبعة عشر', 'ثمانية عشر', 'تسعة عشر'
  ];

  const tens = [
    '', '', 'عشرون', 'ثلاثون', 'أربعون', 'خمسون', 'ستون', 'سبعون', 'ثمانون', 'تسعون'
  ];

  const hundreds = [
    '', 'مائة', 'مائتان', 'ثلاثمائة', 'أربعمائة', 'خمسمائة', 'ستمائة', 'سبعمائة', 'ثمانمائة', 'تسعمائة'
  ];

  const scales = [
    '', 'ألف', 'مليون', 'مليار', 'تريليون'
  ];

  // تعريف العملات المختلفة
  const currencyNames = {
    EGP: {
      singular: 'جنيه',
      dual: 'جنيهان',
      plural: 'جنيهات',
      accusative: 'جنيهاً',
      subunit: {
        singular: 'قرش',
        dual: 'قرشان',
        plural: 'قروش',
        accusative: 'قرشاً'
      }
    },
    USD: {
      singular: 'دولار',
      dual: 'دولاران',
      plural: 'دولارات',
      accusative: 'دولاراً',
      subunit: {
        singular: 'سنت',
        dual: 'سنتان',
        plural: 'سنتات',
        accusative: 'سنتاً'
      }
    },
    EUR: {
      singular: 'يورو',
      dual: 'يوروان',
      plural: 'يوروات',
      accusative: 'يوروا',
      subunit: {
        singular: 'سنت',
        dual: 'سنتان',
        plural: 'سنتات',
        accusative: 'سنتاً'
      }
    },
    SAR: {
      singular: 'ريال',
      dual: 'ريالان',
      plural: 'ريالات',
      accusative: 'ريالاً',
      subunit: {
        singular: 'هللة',
        dual: 'هللتان',
        plural: 'هللات',
        accusative: 'هللة'
      }
    }
  };

  const currencyInfo = currencyNames[currency as keyof typeof currencyNames] || currencyNames.EGP;

  // فصل الجزء الصحيح عن الكسري
  const [integerPart, decimalPart] = num.toString().split('.');
  const integer = parseInt(integerPart);
  
  // تحويل الجزء الصحيح
  let result = convertIntegerToWords(integer, ones, tens, hundreds, scales);
  
  // إضافة العملة الرئيسية
  if (integer === 0) {
    // لا نضيف شيء للصفر
  } else if (integer === 1) {
    result += ' ' + currencyInfo.singular;
  } else if (integer === 2) {
    result += ' ' + currencyInfo.dual;
  } else if (integer >= 3 && integer <= 10) {
    result += ' ' + currencyInfo.plural;
  } else if (integer >= 11) {
    result += ' ' + currencyInfo.accusative;
  }

  // تحويل الجزء الكسري (الوحدة الفرعية)
  if (decimalPart && parseInt(decimalPart) > 0) {
    const decimal = parseInt(decimalPart.padEnd(2, '0').substring(0, 2)); // أخذ أول رقمين فقط
    if (decimal > 0) {
      const decimalWords = convertIntegerToWords(decimal, ones, tens, hundreds, scales);
      if (decimal === 1) {
        result += ' و ' + decimalWords + ' ' + currencyInfo.subunit.singular;
      } else if (decimal === 2) {
        result += ' و ' + decimalWords + ' ' + currencyInfo.subunit.dual;
      } else if (decimal >= 3 && decimal <= 10) {
        result += ' و ' + decimalWords + ' ' + currencyInfo.subunit.plural;
      } else if (decimal >= 11) {
        result += ' و ' + decimalWords + ' ' + currencyInfo.subunit.accusative;
      }
    }
  }

  return result + ' لا غير';
};

const convertIntegerToWords = (
  num: number,
  ones: string[],
  tens: string[],
  hundreds: string[],
  scales: string[]
): string => {
  if (num === 0) return '';
  if (num < 20) return ones[num];
  if (num < 100) {
    const tenDigit = Math.floor(num / 10);
    const oneDigit = num % 10;
    // تصحيح ترتيب الآحاد والعشرات
    return (oneDigit > 0 ? ones[oneDigit] + ' و' : '') + tens[tenDigit];
  }
  if (num < 1000) {
    const hundredDigit = Math.floor(num / 100);
    const remainder = num % 100;
    return hundreds[hundredDigit] + (remainder > 0 ? ' و ' + convertIntegerToWords(remainder, ones, tens, hundreds, scales) : '');
  }

  // للأرقام الأكبر من 1000
  const parts = [];
  
  // تقسيم الرقم بطريقة صحيحة
  if (num >= 1000000000) {
    // المليارات
    const billions = Math.floor(num / 1000000000);
    const remainder = num % 1000000000;
    const billionWords = convertIntegerToWords(billions, ones, tens, hundreds, scales);
    
    if (billions === 1) {
      parts.push('مليار');
    } else if (billions === 2) {
      parts.push('مليارান');
    } else if (billions >= 3 && billions <= 10) {
      parts.push(billionWords + ' مليارات');
    } else {
      parts.push(billionWords + ' مليار');
    }
    
    if (remainder > 0) {
      parts.push(convertIntegerToWords(remainder, ones, tens, hundreds, scales));
    }
  } else if (num >= 1000000) {
    // الملايين
    const millions = Math.floor(num / 1000000);
    const remainder = num % 1000000;
    const millionWords = convertIntegerToWords(millions, ones, tens, hundreds, scales);
    
    if (millions === 1) {
      parts.push('مليون');
    } else if (millions === 2) {
      parts.push('مليونان');
    } else if (millions >= 3 && millions <= 10) {
      parts.push(millionWords + ' ملايين');
    } else {
      parts.push(millionWords + ' مليون');
    }
    
    if (remainder > 0) {
      parts.push(convertIntegerToWords(remainder, ones, tens, hundreds, scales));
    }
  } else if (num >= 1000) {
    // الآلاف
    const thousands = Math.floor(num / 1000);
    const remainder = num % 1000;
    const thousandWords = convertIntegerToWords(thousands, ones, tens, hundreds, scales);
    
    if (thousands === 1) {
      parts.push('ألف');
    } else if (thousands === 2) {
      parts.push('ألفان');
    } else if (thousands >= 3 && thousands <= 10) {
      parts.push(thousandWords + ' آلاف');
    } else {
      parts.push(thousandWords + ' ألفاً');
    }
    
    if (remainder > 0) {
      parts.push(convertIntegerToWords(remainder, ones, tens, hundreds, scales));
    }
  } else {
    // أقل من 1000
    return convertIntegerToWords(num, ones, tens, hundreds, scales);
  }
  
  return parts.join(' و ');
};

// دالة مساعدة لتنسيق النص
export const formatArabicNumber = (text: string): string => {
  return text.replace(/\s+/g, ' ').trim();
};
