const crypto = require('crypto-js');
const fs = require('fs');
const path = require('path');

// إعدادات الترخيص
const LICENSE_CONFIG = {
  secretKey: 'MarketManager2024SecretKey',
  licenseFilePath: path.join(__dirname, '..', '..', 'licenses.json'),
  userLicenseFile: path.join(__dirname, '..', '..', 'user-license.json')
};

/**
 * التحقق من صحة مفتاح الترخيص
 * @param {string} licenseKey - مفتاح الترخيص
 * @returns {object} - نتيجة التحقق
 */
function validateLicense(licenseKey) {
  try {
    // التحقق من تنسيق المفتاح
    if (!licenseKey || !licenseKey.startsWith('MM-')) {
      return {
        isValid: false,
        error: 'تنسيق مفتاح الترخيص غير صحيح',
        errorCode: 'INVALID_FORMAT'
      };
    }

    // قراءة ملف التراخيص
    if (!fs.existsSync(LICENSE_CONFIG.licenseFilePath)) {
      return {
        isValid: false,
        error: 'ملف التراخيص غير موجود',
        errorCode: 'NO_LICENSE_FILE'
      };
    }

    const licensesData = fs.readFileSync(LICENSE_CONFIG.licenseFilePath, 'utf8');
    const licenses = JSON.parse(licensesData);

    // البحث عن الترخيص
    const license = licenses.find(l => l.licenseKey === licenseKey);
    
    if (!license) {
      return {
        isValid: false,
        error: 'مفتاح الترخيص غير موجود',
        errorCode: 'LICENSE_NOT_FOUND'
      };
    }

    // التحقق من تاريخ الانتهاء
    const now = new Date();
    const expiryDate = new Date(license.expiresAt);
    
    if (now > expiryDate) {
      return {
        isValid: false,
        error: 'انتهت صلاحية الترخيص',
        errorCode: 'LICENSE_EXPIRED',
        expiryDate: expiryDate.toLocaleDateString('ar-SA')
      };
    }

    // التحقق من حالة الترخيص
    if (!license.isActive) {
      return {
        isValid: false,
        error: 'الترخيص غير مفعل',
        errorCode: 'LICENSE_INACTIVE'
      };
    }

    // الترخيص صالح
    return {
      isValid: true,
      license: {
        id: license.id,
        customerName: license.customerName,
        customerEmail: license.customerEmail,
        createdAt: license.createdAt,
        expiresAt: license.expiresAt,
        daysRemaining: Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24))
      }
    };

  } catch (error) {
    return {
      isValid: false,
      error: 'خطأ في التحقق من الترخيص: ' + error.message,
      errorCode: 'VALIDATION_ERROR'
    };
  }
}

/**
 * حفظ معلومات الترخيص المفعل
 * @param {object} licenseInfo - معلومات الترخيص
 */
function saveActivatedLicense(licenseInfo) {
  try {
    const userData = {
      licenseKey: licenseInfo.licenseKey,
      activatedAt: new Date().toISOString(),
      license: licenseInfo.license
    };

    fs.writeFileSync(LICENSE_CONFIG.userLicenseFile, JSON.stringify(userData, null, 2));
    return true;
  } catch (error) {
    console.error('خطأ في حفظ بيانات الترخيص:', error);
    return false;
  }
}

/**
 * قراءة الترخيص المحفوظ
 * @returns {object|null} - بيانات الترخيص أو null
 */
function getSavedLicense() {
  try {
    if (!fs.existsSync(LICENSE_CONFIG.userLicenseFile)) {
      return null;
    }

    const userData = fs.readFileSync(LICENSE_CONFIG.userLicenseFile, 'utf8');
    return JSON.parse(userData);
  } catch (error) {
    console.error('خطأ في قراءة الترخيص المحفوظ:', error);
    return null;
  }
}

/**
 * التحقق من الترخيص المحفوظ
 * @returns {object} - نتيجة التحقق
 */
function checkSavedLicense() {
  const savedLicense = getSavedLicense();
  
  if (!savedLicense) {
    return {
      isValid: false,
      error: 'لا يوجد ترخيص محفوظ',
      errorCode: 'NO_SAVED_LICENSE'
    };
  }

  // التحقق من صحة الترخيص المحفوظ
  return validateLicense(savedLicense.licenseKey);
}

/**
 * حذف الترخيص المحفوظ
 */
function clearSavedLicense() {
  try {
    if (fs.existsSync(LICENSE_CONFIG.userLicenseFile)) {
      fs.unlinkSync(LICENSE_CONFIG.userLicenseFile);
    }
    return true;
  } catch (error) {
    console.error('خطأ في حذف الترخيص:', error);
    return false;
  }
}

/**
 * تفعيل الترخيص
 * @param {string} licenseKey - مفتاح الترخيص
 * @returns {object} - نتيجة التفعيل
 */
function activateLicense(licenseKey) {
  const validation = validateLicense(licenseKey);
  
  if (!validation.isValid) {
    return validation;
  }

  // حفظ الترخيص
  const saved = saveActivatedLicense({
    licenseKey: licenseKey,
    license: validation.license
  });

  if (!saved) {
    return {
      isValid: false,
      error: 'فشل في حفظ بيانات الترخيص',
      errorCode: 'SAVE_ERROR'
    };
  }

  return {
    isValid: true,
    message: 'تم تفعيل الترخيص بنجاح',
    license: validation.license
  };
}

/**
 * الحصول على معلومات الترخيص الحالي
 * @returns {object} - معلومات الترخيص
 */
function getCurrentLicenseInfo() {
  const savedLicense = getSavedLicense();

  if (!savedLicense) {
    return null;
  }

  const validation = validateLicense(savedLicense.licenseKey);

  if (!validation.isValid) {
    return null;
  }

  // إضافة مفتاح الترخيص للمعلومات المرجعة
  return {
    ...validation.license,
    activatedAt: savedLicense.activatedAt,
    licenseKey: savedLicense.licenseKey
  };
}

/**
 * التحقق من انتهاء صلاحية الترخيص قريباً
 * @param {number} warningDays - عدد الأيام للتحذير (افتراضي: 7)
 * @returns {boolean} - true إذا كان الترخيص سينتهي قريباً
 */
function isLicenseExpiringSoon(warningDays = 7) {
  const licenseInfo = getCurrentLicenseInfo();
  
  if (!licenseInfo) {
    return false;
  }

  return licenseInfo.daysRemaining <= warningDays;
}

/**
 * قراءة التراخيص من الملف
 * @returns {array} - قائمة التراخيص
 */
function getLicenses() {
  try {
    if (!fs.existsSync(LICENSE_CONFIG.licenseFilePath)) {
      return [];
    }
    const licensesData = fs.readFileSync(LICENSE_CONFIG.licenseFilePath, 'utf8');
    return JSON.parse(licensesData);
  } catch (error) {
    console.error('خطأ في قراءة التراخيص:', error);
    return [];
  }
}

/**
 * إنشاء مفتاح ترخيص جديد
 * @returns {string} - مفتاح الترخيص
 */
function generateLicenseKey() {
  const crypto = require('crypto');

  // إنشاء مفتاح عشوائي
  const randomBytes = crypto.randomBytes(16);
  const base64Key = randomBytes.toString('base64');

  // تنظيف المفتاح وإضافة بادئة
  const cleanKey = base64Key.replace(/[+/=]/g, '').substring(0, 20);

  return `MM-${cleanKey}`;
}

/**
 * حفظ التراخيص في الملف
 * @param {array} licenses - قائمة التراخيص
 * @returns {boolean} - نجح الحفظ أم لا
 */
function saveLicenses(licenses) {
  try {
    fs.writeFileSync(LICENSE_CONFIG.licenseFilePath, JSON.stringify(licenses, null, 2));
    return true;
  } catch (error) {
    console.error('خطأ في حفظ التراخيص:', error);
    return false;
  }
}

/**
 * جلب جميع التراخيص
 * @returns {object} - نتيجة العملية
 */
function getAllLicenses() {
  try {
    const licenses = getLicenses();
    return {
      success: true,
      licenses: licenses
    };
  } catch (error) {
    console.error('خطأ في جلب التراخيص:', error);
    return {
      success: false,
      error: 'خطأ في جلب التراخيص'
    };
  }
}

/**
 * إنشاء ترخيص جديد
 * @param {object} licenseData - بيانات الترخيص
 * @returns {object} - نتيجة العملية
 */
function createLicense(licenseData) {
  try {
    const licenses = getLicenses();

    // إنشاء مفتاح ترخيص جديد
    const licenseKey = generateLicenseKey();

    // حساب تاريخ الانتهاء
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + licenseData.durationDays);

    const newLicense = {
      licenseKey: licenseKey,
      id: `license-${Date.now()}`,
      customerName: licenseData.customerName,
      customerEmail: licenseData.customerEmail,
      createdAt: new Date().toISOString(),
      expiresAt: expiresAt.toISOString(),
      durationDays: licenseData.durationDays,
      isActive: true,
      activatedAt: null,
      activatedBy: null
    };

    licenses.push(newLicense);

    if (saveLicenses(licenses)) {
      return {
        success: true,
        license: newLicense,
        message: 'تم إنشاء الترخيص بنجاح'
      };
    } else {
      return {
        success: false,
        error: 'فشل في حفظ الترخيص'
      };
    }
  } catch (error) {
    console.error('خطأ في إنشاء الترخيص:', error);
    return {
      success: false,
      error: 'خطأ في إنشاء الترخيص'
    };
  }
}

/**
 * حذف ترخيص
 * @param {string} licenseId - معرف الترخيص
 * @returns {object} - نتيجة العملية
 */
function deleteLicense(licenseId) {
  try {
    const licenses = getLicenses();
    const licenseIndex = licenses.findIndex(l => l.id === licenseId);

    if (licenseIndex === -1) {
      return {
        success: false,
        error: 'الترخيص غير موجود'
      };
    }

    licenses.splice(licenseIndex, 1);

    if (saveLicenses(licenses)) {
      return {
        success: true,
        message: 'تم حذف الترخيص بنجاح'
      };
    } else {
      return {
        success: false,
        error: 'فشل في حفظ التغييرات'
      };
    }
  } catch (error) {
    console.error('خطأ في حذف الترخيص:', error);
    return {
      success: false,
      error: 'خطأ في حذف الترخيص'
    };
  }
}

/**
 * تحديث ترخيص موجود
 * @param {object} updateData - بيانات التحديث
 * @returns {object} - نتيجة العملية
 */
function updateLicense(updateData) {
  try {
    const licenses = getLicenses();
    const licenseIndex = licenses.findIndex(l => l.id === updateData.licenseId);

    if (licenseIndex === -1) {
      return {
        success: false,
        error: 'الترخيص غير موجود'
      };
    }

    const license = licenses[licenseIndex];

    // تحديث البيانات الأساسية
    license.customerName = updateData.customerName;
    license.customerEmail = updateData.customerEmail;
    license.isActive = updateData.isActive;

    // تحديث تاريخ الانتهاء إذا تم إضافة أيام
    if (updateData.additionalDays && updateData.additionalDays !== 0) {
      const currentExpiry = new Date(license.expiresAt);
      const additionalMs = updateData.additionalDays * 24 * 60 * 60 * 1000;
      const newExpiry = new Date(currentExpiry.getTime() + additionalMs);

      license.expiresAt = newExpiry.toISOString();

      // تحديث المدة الإجمالية
      const createdDate = new Date(license.createdAt);
      const totalDays = Math.ceil((newExpiry - createdDate) / (1000 * 60 * 60 * 24));
      license.durationDays = totalDays;
    }

    // إضافة تاريخ آخر تحديث
    license.updatedAt = new Date().toISOString();

    if (saveLicenses(licenses)) {
      return {
        success: true,
        license: license,
        message: 'تم تحديث الترخيص بنجاح'
      };
    } else {
      return {
        success: false,
        error: 'فشل في حفظ التغييرات'
      };
    }
  } catch (error) {
    console.error('خطأ في تحديث الترخيص:', error);
    return {
      success: false,
      error: 'خطأ في تحديث الترخيص'
    };
  }
}

module.exports = {
  validateLicense,
  activateLicense,
  checkSavedLicense,
  getCurrentLicenseInfo,
  clearSavedLicense,
  isLicenseExpiringSoon,
  saveActivatedLicense,
  getSavedLicense,
  getAllLicenses,
  createLicense,
  deleteLicense,
  updateLicense
};
