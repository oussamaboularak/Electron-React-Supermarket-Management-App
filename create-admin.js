const authUtils = require('./src/utils/auth');

console.log('🔧 إنشاء حساب الأدمن...\n');

// إنشاء حساب الأدمن
const result = authUtils.createAdminAccount();

if (result.success) {
  console.log('✅ تم إنشاء حساب الأدمن بنجاح!');
  console.log('\n📋 بيانات الدخول:');
  console.log('اسم المستخدم: admin');
  console.log('كلمة المرور: admin123');
  console.log('البريد الإلكتروني: admin@marketmanager.com');
  console.log('\n🚀 يمكنك الآن تسجيل الدخول بهذه البيانات');
} else {
  console.error('❌ فشل في إنشاء حساب الأدمن:', result.error);
}
