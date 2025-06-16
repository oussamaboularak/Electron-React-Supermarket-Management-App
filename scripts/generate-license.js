const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto-js');

// إعدادات النظام
const LICENSE_CONFIG = {
  secretKey: 'MarketManager2024SecretKey', // مفتاح سري لتشفير البيانات
  defaultDurationDays: 30, // مدة الترخيص الافتراضية (30 يوم)
  licenseFilePath: path.join(__dirname, '..', 'licenses.json')
};

/**
 * إنشاء مفتاح ترخيص جديد
 * @param {number} durationDays - مدة الترخيص بالأيام (افتراضي: 30)
 * @param {string} customerName - اسم العميل (اختياري)
 * @param {string} customerEmail - بريد العميل (اختياري)
 * @returns {object} - بيانات الترخيص
 */
function generateLicense(durationDays = LICENSE_CONFIG.defaultDurationDays, customerName = '', customerEmail = '') {
  const licenseId = uuidv4();
  const createdAt = new Date();
  const expiresAt = new Date(createdAt.getTime() + (durationDays * 24 * 60 * 60 * 1000));
  
  // بيانات الترخيص
  const licenseData = {
    id: licenseId,
    customerName: customerName,
    customerEmail: customerEmail,
    createdAt: createdAt.toISOString(),
    expiresAt: expiresAt.toISOString(),
    durationDays: durationDays,
    isActive: true,
    activatedAt: null,
    activatedBy: null
  };

  // تشفير بيانات الترخيص لإنشاء المفتاح
  const encryptedData = crypto.AES.encrypt(JSON.stringify({
    id: licenseId,
    exp: expiresAt.getTime()
  }), LICENSE_CONFIG.secretKey).toString();

  // إنشاء مفتاح الترخيص النهائي
  const licenseKey = `MM-${Buffer.from(encryptedData).toString('base64').replace(/[+/=]/g, '').substring(0, 25)}`;

  return {
    licenseKey: licenseKey,
    licenseData: licenseData
  };
}

/**
 * حفظ الترخيص في ملف JSON
 * @param {object} license - بيانات الترخيص
 */
function saveLicense(license) {
  let licenses = [];
  
  // قراءة التراخيص الموجودة
  if (fs.existsSync(LICENSE_CONFIG.licenseFilePath)) {
    try {
      const data = fs.readFileSync(LICENSE_CONFIG.licenseFilePath, 'utf8');
      licenses = JSON.parse(data);
    } catch (error) {
      console.error('خطأ في قراءة ملف التراخيص:', error.message);
      licenses = [];
    }
  }

  // إضافة الترخيص الجديد
  licenses.push({
    licenseKey: license.licenseKey,
    ...license.licenseData
  });

  // حفظ الملف
  try {
    fs.writeFileSync(LICENSE_CONFIG.licenseFilePath, JSON.stringify(licenses, null, 2));
    console.log('✅ تم حفظ الترخيص بنجاح في:', LICENSE_CONFIG.licenseFilePath);
  } catch (error) {
    console.error('❌ خطأ في حفظ الترخيص:', error.message);
  }
}

/**
 * إنشاء عدة تراخيص
 * @param {number} count - عدد التراخيص
 * @param {number} durationDays - مدة كل ترخيص
 */
function generateMultipleLicenses(count, durationDays = LICENSE_CONFIG.defaultDurationDays) {
  console.log(`🔑 إنشاء ${count} ترخيص لمدة ${durationDays} يوم...\n`);
  
  for (let i = 1; i <= count; i++) {
    const license = generateLicense(durationDays, `Customer ${i}`, `customer${i}@example.com`);
    saveLicense(license);
    
    console.log(`الترخيص ${i}:`);
    console.log(`  المفتاح: ${license.licenseKey}`);
    console.log(`  تاريخ الإنشاء: ${new Date(license.licenseData.createdAt).toLocaleDateString('ar-SA')}`);
    console.log(`  تاريخ الانتهاء: ${new Date(license.licenseData.expiresAt).toLocaleDateString('ar-SA')}`);
    console.log('  ─────────────────────────────────────────\n');
  }
}

/**
 * عرض التراخيص الموجودة
 */
function listLicenses() {
  if (!fs.existsSync(LICENSE_CONFIG.licenseFilePath)) {
    console.log('❌ لا توجد تراخيص محفوظة');
    return;
  }

  try {
    const data = fs.readFileSync(LICENSE_CONFIG.licenseFilePath, 'utf8');
    const licenses = JSON.parse(data);
    
    console.log(`📋 إجمالي التراخيص: ${licenses.length}\n`);
    
    licenses.forEach((license, index) => {
      const isExpired = new Date(license.expiresAt) < new Date();
      const status = isExpired ? '❌ منتهي' : '✅ صالح';
      
      console.log(`${index + 1}. ${license.licenseKey}`);
      console.log(`   العميل: ${license.customerName || 'غير محدد'}`);
      console.log(`   الحالة: ${status}`);
      console.log(`   ينتهي في: ${new Date(license.expiresAt).toLocaleDateString('ar-SA')}`);
      console.log('   ─────────────────────────────────────────');
    });
  } catch (error) {
    console.error('❌ خطأ في قراءة التراخيص:', error.message);
  }
}

// معالجة الأوامر من سطر الأوامر
function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case 'generate':
      const count = parseInt(args[1]) || 1;
      const days = parseInt(args[2]) || LICENSE_CONFIG.defaultDurationDays;
      generateMultipleLicenses(count, days);
      break;
      
    case 'list':
      listLicenses();
      break;
      
    case 'single':
      const customerName = args[1] || '';
      const customerEmail = args[2] || '';
      const duration = parseInt(args[3]) || LICENSE_CONFIG.defaultDurationDays;
      
      const license = generateLicense(duration, customerName, customerEmail);
      saveLicense(license);
      
      console.log('🔑 تم إنشاء ترخيص جديد:');
      console.log(`المفتاح: ${license.licenseKey}`);
      console.log(`العميل: ${customerName || 'غير محدد'}`);
      console.log(`المدة: ${duration} يوم`);
      break;
      
    default:
      console.log(`
🔑 مولد تراخيص Market Manager

الاستخدام:
  node generate-license.js generate [عدد] [مدة بالأيام]     - إنشاء عدة تراخيص
  node generate-license.js single [اسم] [بريد] [مدة]        - إنشاء ترخيص واحد
  node generate-license.js list                            - عرض جميع التراخيص

أمثلة:
  node generate-license.js generate 5 30                   - إنشاء 5 تراخيص لمدة 30 يوم
  node generate-license.js single "أحمد محمد" "ahmed@example.com" 60
  node generate-license.js list
      `);
  }
}

// تشغيل السكربت
if (require.main === module) {
  main();
}

module.exports = {
  generateLicense,
  saveLicense,
  LICENSE_CONFIG
};
