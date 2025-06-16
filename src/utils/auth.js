const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// إعدادات المصادقة
const AUTH_CONFIG = {
  secretKey: 'MarketManager2024AuthSecret',
  usersFilePath: path.join(__dirname, '..', '..', 'users.json'),
  sessionsFilePath: path.join(__dirname, '..', '..', 'sessions.json'),
  saltRounds: 10
};

/**
 * تشفير كلمة المرور
 * @param {string} password - كلمة المرور
 * @returns {object} - كلمة المرور المشفرة والملح
 */
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return { hash, salt };
}

/**
 * التحقق من كلمة المرور
 * @param {string} password - كلمة المرور
 * @param {string} hash - الهاش المحفوظ
 * @param {string} salt - الملح المحفوظ
 * @returns {boolean} - صحة كلمة المرور
 */
function verifyPassword(password, hash, salt) {
  const hashVerify = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return hash === hashVerify;
}

/**
 * إنشاء رمز الجلسة
 * @returns {string} - رمز الجلسة
 */
function generateSessionToken() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * قراءة ملف المستخدمين
 * @returns {array} - قائمة المستخدمين
 */
function getUsers() {
  try {
    if (!fs.existsSync(AUTH_CONFIG.usersFilePath)) {
      // إنشاء مستخدم أدمن افتراضي
      const defaultAdmin = createDefaultAdmin();
      return [defaultAdmin];
    }
    const usersData = fs.readFileSync(AUTH_CONFIG.usersFilePath, 'utf8');
    return JSON.parse(usersData);
  } catch (error) {
    console.error('خطأ في قراءة ملف المستخدمين:', error);
    return [];
  }
}

/**
 * حفظ ملف المستخدمين
 * @param {array} users - قائمة المستخدمين
 */
function saveUsers(users) {
  try {
    fs.writeFileSync(AUTH_CONFIG.usersFilePath, JSON.stringify(users, null, 2));
    return true;
  } catch (error) {
    console.error('خطأ في حفظ ملف المستخدمين:', error);
    return false;
  }
}

/**
 * إنشاء مستخدم أدمن افتراضي
 * @returns {object} - بيانات المستخدم الأدمن
 */
function createDefaultAdmin() {
  const { hash, salt } = hashPassword('admin123');
  const admin = {
    id: 'admin-001',
    username: 'admin',
    email: 'admin@marketmanager.com',
    fullName: 'مدير النظام',
    role: 'admin',
    isActive: true,
    createdAt: new Date().toISOString(),
    lastLogin: null,
    passwordHash: hash,
    passwordSalt: salt
  };

  // حفظ الأدمن في ملف المستخدمين
  const users = [admin];
  saveUsers(users);
  console.log('تم إنشاء حساب الأدمن الافتراضي:', admin.username);

  return admin;
}

/**
 * تسجيل مستخدم جديد
 * @param {object} userData - بيانات المستخدم
 * @returns {object} - نتيجة التسجيل
 */
function registerUser(userData) {
  try {
    const users = getUsers();
    
    // التحقق من عدم وجود المستخدم
    const existingUser = users.find(u => 
      u.username === userData.username || u.email === userData.email
    );
    
    if (existingUser) {
      return {
        success: false,
        error: 'اسم المستخدم أو البريد الإلكتروني موجود بالفعل',
        errorCode: 'USER_EXISTS'
      };
    }

    // تشفير كلمة المرور
    const { hash, salt } = hashPassword(userData.password);

    // إنشاء المستخدم الجديد
    const newUser = {
      id: `user-${Date.now()}`,
      username: userData.username,
      email: userData.email,
      fullName: userData.fullName,
      role: userData.role || 'user',
      isActive: true,
      createdAt: new Date().toISOString(),
      lastLogin: null,
      passwordHash: hash,
      passwordSalt: salt
    };

    users.push(newUser);
    
    if (saveUsers(users)) {
      // إزالة معلومات كلمة المرور من الاستجابة
      const { passwordHash, passwordSalt, ...userResponse } = newUser;
      return {
        success: true,
        user: userResponse,
        message: 'تم إنشاء الحساب بنجاح'
      };
    } else {
      return {
        success: false,
        error: 'فشل في حفظ بيانات المستخدم',
        errorCode: 'SAVE_ERROR'
      };
    }

  } catch (error) {
    return {
      success: false,
      error: 'خطأ في إنشاء الحساب: ' + error.message,
      errorCode: 'REGISTRATION_ERROR'
    };
  }
}

/**
 * تسجيل الدخول
 * @param {string} username - اسم المستخدم
 * @param {string} password - كلمة المرور
 * @returns {object} - نتيجة تسجيل الدخول
 */
function loginUser(username, password) {
  try {
    const users = getUsers();
    
    // البحث عن المستخدم
    const user = users.find(u => 
      (u.username === username || u.email === username) && u.isActive
    );
    
    if (!user) {
      return {
        success: false,
        error: 'اسم المستخدم أو كلمة المرور غير صحيحة',
        errorCode: 'INVALID_CREDENTIALS'
      };
    }

    // التحقق من كلمة المرور
    if (!verifyPassword(password, user.passwordHash, user.passwordSalt)) {
      return {
        success: false,
        error: 'اسم المستخدم أو كلمة المرور غير صحيحة',
        errorCode: 'INVALID_CREDENTIALS'
      };
    }

    // إنشاء جلسة جديدة
    const sessionToken = generateSessionToken();
    const session = {
      token: sessionToken,
      userId: user.id,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 ساعة
      isActive: true
    };

    // حفظ الجلسة
    saveSessions([session]);

    // تحديث آخر تسجيل دخول
    user.lastLogin = new Date().toISOString();
    saveUsers(users);

    // إزالة معلومات كلمة المرور من الاستجابة
    const { passwordHash, passwordSalt, ...userResponse } = user;

    return {
      success: true,
      user: userResponse,
      sessionToken: sessionToken,
      message: 'تم تسجيل الدخول بنجاح'
    };

  } catch (error) {
    return {
      success: false,
      error: 'خطأ في تسجيل الدخول: ' + error.message,
      errorCode: 'LOGIN_ERROR'
    };
  }
}

/**
 * قراءة ملف الجلسات
 * @returns {array} - قائمة الجلسات
 */
function getSessions() {
  try {
    if (!fs.existsSync(AUTH_CONFIG.sessionsFilePath)) {
      return [];
    }
    const sessionsData = fs.readFileSync(AUTH_CONFIG.sessionsFilePath, 'utf8');
    return JSON.parse(sessionsData);
  } catch (error) {
    console.error('خطأ في قراءة ملف الجلسات:', error);
    return [];
  }
}

/**
 * حفظ ملف الجلسات
 * @param {array} sessions - قائمة الجلسات
 */
function saveSessions(sessions) {
  try {
    fs.writeFileSync(AUTH_CONFIG.sessionsFilePath, JSON.stringify(sessions, null, 2));
    return true;
  } catch (error) {
    console.error('خطأ في حفظ ملف الجلسات:', error);
    return false;
  }
}

/**
 * التحقق من صحة الجلسة
 * @param {string} sessionToken - رمز الجلسة
 * @returns {object} - نتيجة التحقق
 */
function validateSession(sessionToken) {
  try {
    const sessions = getSessions();
    const session = sessions.find(s => s.token === sessionToken && s.isActive);
    
    if (!session) {
      return {
        isValid: false,
        error: 'جلسة غير صالحة',
        errorCode: 'INVALID_SESSION'
      };
    }

    // التحقق من انتهاء الجلسة
    if (new Date() > new Date(session.expiresAt)) {
      return {
        isValid: false,
        error: 'انتهت صلاحية الجلسة',
        errorCode: 'SESSION_EXPIRED'
      };
    }

    // الحصول على بيانات المستخدم
    const users = getUsers();
    const user = users.find(u => u.id === session.userId && u.isActive);
    
    if (!user) {
      return {
        isValid: false,
        error: 'المستخدم غير موجود أو غير مفعل',
        errorCode: 'USER_NOT_FOUND'
      };
    }

    // إزالة معلومات كلمة المرور
    const { passwordHash, passwordSalt, ...userResponse } = user;

    return {
      isValid: true,
      user: userResponse,
      session: session
    };

  } catch (error) {
    return {
      isValid: false,
      error: 'خطأ في التحقق من الجلسة: ' + error.message,
      errorCode: 'VALIDATION_ERROR'
    };
  }
}

/**
 * تسجيل الخروج
 * @param {string} sessionToken - رمز الجلسة
 * @returns {object} - نتيجة تسجيل الخروج
 */
function logoutUser(sessionToken) {
  try {
    const sessions = getSessions();
    const sessionIndex = sessions.findIndex(s => s.token === sessionToken);
    
    if (sessionIndex !== -1) {
      sessions[sessionIndex].isActive = false;
      saveSessions(sessions);
    }

    return {
      success: true,
      message: 'تم تسجيل الخروج بنجاح'
    };

  } catch (error) {
    return {
      success: false,
      error: 'خطأ في تسجيل الخروج: ' + error.message,
      errorCode: 'LOGOUT_ERROR'
    };
  }
}

/**
 * إنشاء حساب أدمن جديد بقوة (يحذف الموجود)
 * @returns {object} - نتيجة الإنشاء
 */
function createAdminAccount() {
  try {
    const { hash, salt } = hashPassword('admin123');
    const admin = {
      id: 'admin-001',
      username: 'admin',
      email: 'admin@marketmanager.com',
      fullName: 'مدير النظام',
      role: 'admin',
      isActive: true,
      createdAt: new Date().toISOString(),
      lastLogin: null,
      passwordHash: hash,
      passwordSalt: salt
    };

    // قراءة المستخدمين الحاليين
    let users = getUsers();

    // حذف أي أدمن موجود
    users = users.filter(user => user.role !== 'admin');

    // إضافة الأدمن الجديد
    users.unshift(admin);

    // حفظ المستخدمين
    if (saveUsers(users)) {
      console.log('✅ تم إنشاء حساب الأدمن بنجاح');
      console.log('اسم المستخدم: admin');
      console.log('كلمة المرور: admin123');

      return {
        success: true,
        message: 'تم إنشاء حساب الأدمن بنجاح',
        admin: {
          username: admin.username,
          email: admin.email,
          fullName: admin.fullName,
          role: admin.role
        }
      };
    } else {
      return {
        success: false,
        error: 'فشل في حفظ حساب الأدمن'
      };
    }
  } catch (error) {
    console.error('خطأ في إنشاء حساب الأدمن:', error);
    return {
      success: false,
      error: 'خطأ في إنشاء حساب الأدمن: ' + error.message
    };
  }
}

/**
 * تحديث مستخدم موجود
 * @param {object} updateData - بيانات التحديث
 * @returns {object} - نتيجة العملية
 */
function updateUser(updateData) {
  try {
    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === updateData.userId);

    if (userIndex === -1) {
      return {
        success: false,
        error: 'المستخدم غير موجود'
      };
    }

    const user = users[userIndex];

    // التحقق من عدم تكرار اسم المستخدم
    const existingUser = users.find(u => u.username === updateData.username && u.id !== updateData.userId);
    if (existingUser) {
      return {
        success: false,
        error: 'اسم المستخدم موجود بالفعل'
      };
    }

    // التحقق من عدم تكرار البريد الإلكتروني
    const existingEmail = users.find(u => u.email === updateData.email && u.id !== updateData.userId);
    if (existingEmail) {
      return {
        success: false,
        error: 'البريد الإلكتروني موجود بالفعل'
      };
    }

    // تحديث البيانات الأساسية
    user.username = updateData.username;
    user.email = updateData.email;
    user.fullName = updateData.fullName;
    user.role = updateData.role;
    user.isActive = updateData.isActive;
    user.updatedAt = new Date().toISOString();

    // تحديث كلمة المرور إذا تم توفيرها
    if (updateData.newPassword) {
      const { hash, salt } = hashPassword(updateData.newPassword);
      user.passwordHash = hash;
      user.passwordSalt = salt;
    }

    if (saveUsers(users)) {
      // إزالة كلمة المرور من الاستجابة
      const { passwordHash, passwordSalt, ...safeUser } = user;

      return {
        success: true,
        user: safeUser,
        message: 'تم تحديث المستخدم بنجاح'
      };
    } else {
      return {
        success: false,
        error: 'فشل في حفظ التغييرات'
      };
    }
  } catch (error) {
    console.error('خطأ في تحديث المستخدم:', error);
    return {
      success: false,
      error: 'خطأ في تحديث المستخدم'
    };
  }
}

module.exports = {
  registerUser,
  loginUser,
  validateSession,
  logoutUser,
  getUsers,
  saveUsers,
  hashPassword,
  verifyPassword,
  createAdminAccount,
  updateUser
};
