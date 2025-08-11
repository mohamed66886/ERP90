// اختبار سريع لدالة تحويل الأرقام إلى كلمات مع العملات المختلفة
const { numberToArabicWords } = require('./src/utils/numberToWords.ts');

// اختبار بعض الأرقام مع عملات مختلفة
const testCases = [
  { amount: 25200, currency: 'EGP', expected: 'خمسة وعشرون ألفاً ومائتان جنيهاً' },
  { amount: 1000, currency: 'USD', expected: 'ألف دولار' },
  { amount: 2500, currency: 'EUR', expected: 'ألفان وخمسمائة يوروا' },
  { amount: 15.50, currency: 'SAR', expected: 'خمسة عشر ريالاً وخمسون هللة' },
  { amount: 100, currency: 'EGP', expected: 'مائة جنيه' },
  { amount: 1500.25, currency: 'USD', expected: 'ألف وخمسمائة دولاراً وخمسة وعشرون سنتاً' },
];

console.log('اختبار تحويل الأرقام إلى كلمات عربية مع العملات المختلفة:');
console.log('=======================================================');

testCases.forEach(({ amount, currency, expected }) => {
  const result = numberToArabicWords(amount, currency);
  console.log(`${amount} ${currency} = ${result}`);
  console.log(`متوقع: ${expected} لا غير`);
  console.log('---');
});
