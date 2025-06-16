// اختبار سريع للعملة التركية
const { formatCurrency, getCurrencySymbol, getCurrencyName } = require('./src/utils/helpers');

console.log('🇹🇷 اختبار العملة التركية:');
console.log('================================');

// اختبار تنسيق العملة
console.log('تنسيق العملة:');
console.log('100 TRY:', formatCurrency(100, 'TRY'));
console.log('1234.56 TRY:', formatCurrency(1234.56, 'TRY'));
console.log('1500000 TRY:', formatCurrency(1500000, 'TRY'));

console.log('\nرموز العملات:');
console.log('TRY Symbol:', getCurrencySymbol('TRY'));
console.log('USD Symbol:', getCurrencySymbol('USD'));
console.log('EUR Symbol:', getCurrencySymbol('EUR'));

console.log('\nأسماء العملات:');
console.log('TRY Name:', getCurrencyName('TRY'));
console.log('USD Name:', getCurrencyName('USD'));
console.log('SAR Name:', getCurrencyName('SAR'));

console.log('\nمقارنة العملات:');
const amount = 1234.56;
console.log('USD:', formatCurrency(amount, 'USD'));
console.log('EUR:', formatCurrency(amount, 'EUR'));
console.log('GBP:', formatCurrency(amount, 'GBP'));
console.log('SAR:', formatCurrency(amount, 'SAR'));
console.log('AED:', formatCurrency(amount, 'AED'));
console.log('EGP:', formatCurrency(amount, 'EGP'));
console.log('TRY:', formatCurrency(amount, 'TRY'));

console.log('\n✅ اختبار العملة التركية مكتمل!');
