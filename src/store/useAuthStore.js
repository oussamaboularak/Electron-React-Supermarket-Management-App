import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// محاكاة المصادقة للويب - نفس بيانات التطبيق
const simulateWebAuth = async (credentials) => {
  // محاكاة تأخير الشبكة
  await new Promise(resolve => setTimeout(resolve, 1000));

  // نفس بيانات المستخدمين المستخدمة في التطبيق
  const webUsers = [
    {
      id: 'admin-001',
      username: 'admin',
      email: 'admin@marketmanager.com',
      fullName: 'مدير النظام',
      role: 'admin',
      isActive: true,
      password: 'admin123',
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    },
    {
      id: 'user-001',
      username: 'user',
      email: 'user@marketmanager.com',
      fullName: 'مستخدم تجريبي',
      role: 'user',
      isActive: true,
      password: 'user123',
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    }
  ];

  const user = webUsers.find(u =>
    (u.username === credentials.username || u.email === credentials.username) &&
    u.password === credentials.password
  );

  if (!user) {
    return {
      success: false,
      error: 'اسم المستخدم أو كلمة المرور غير صحيحة'
    };
  }

  if (!user.isActive) {
    return {
      success: false,
      error: 'الحساب غير مفعل'
    };
  }

  // إنشاء رمز جلسة وهمي
  const sessionToken = 'web-session-' + Math.random().toString(36).substr(2, 9);

  // إزالة كلمة المرور من الاستجابة
  const { password, ...safeUser } = user;

  return {
    success: true,
    user: safeUser,
    sessionToken: sessionToken,
    message: 'تم تسجيل الدخول بنجاح'
  };
};

const useAuthStore = create(
  persist(
    (set, get) => ({
      // الحالة
      user: null,
      sessionToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // الإجراءات
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      
      setSessionToken: (token) => set({ sessionToken: token }),
      
      setLoading: (isLoading) => set({ isLoading }),
      
      setError: (error) => set({ error }),
      
      clearError: () => set({ error: null }),

      // تسجيل الدخول
      login: async (credentials) => {
        set({ isLoading: true, error: null });

        try {
          // Check if we're in Electron environment
          const isElectron = window.require && window.require('electron');
          const { ipcRenderer } = isElectron ? window.require('electron') : { ipcRenderer: null };

          if (ipcRenderer && isElectron) {
            // وضع سطح المكتب
            const result = await ipcRenderer.invoke('auth-login', credentials);

            if (result.success) {
              set({
                user: result.user,
                sessionToken: result.sessionToken,
                isAuthenticated: true,
                isLoading: false,
                error: null
              });
              return { success: true, message: result.message };
            } else {
              set({
                isLoading: false,
                error: result.error
              });
              return { success: false, error: result.error };
            }
          } else {
            // وضع الويب - محاكاة المصادقة
            const result = await simulateWebAuth(credentials);

            if (result.success) {
              set({
                user: result.user,
                sessionToken: result.sessionToken,
                isAuthenticated: true,
                isLoading: false,
                error: null
              });
              return { success: true, message: result.message };
            } else {
              set({
                isLoading: false,
                error: result.error
              });
              return { success: false, error: result.error };
            }
          }
        } catch (error) {
          const errorMessage = error.message || 'خطأ في تسجيل الدخول';
          set({
            isLoading: false,
            error: errorMessage
          });
          return { success: false, error: errorMessage };
        }
      },

      // تسجيل حساب جديد
      register: async (userData) => {
        set({ isLoading: true, error: null });

        try {
          // Check if we're in Electron environment
          const isElectron = window.require && window.require('electron');
          const { ipcRenderer } = isElectron ? window.require('electron') : { ipcRenderer: null };

          if (ipcRenderer && isElectron) {
            // وضع سطح المكتب
            const result = await ipcRenderer.invoke('auth-register', userData);

            if (result.success) {
              set({
                isLoading: false,
                error: null
              });
              return { success: true, message: result.message };
            } else {
              set({
                isLoading: false,
                error: result.error
              });
              return { success: false, error: result.error };
            }
          } else {
            // وضع الويب - التسجيل غير متاح
            set({
              isLoading: false,
              error: 'إنشاء الحسابات متاح فقط من خلال المدير'
            });
            return {
              success: false,
              error: 'إنشاء الحسابات متاح فقط من خلال المدير'
            };
          }
        } catch (error) {
          const errorMessage = error.message || 'خطأ في إنشاء الحساب';
          set({
            isLoading: false,
            error: errorMessage
          });
          return { success: false, error: errorMessage };
        }
      },

      // التحقق من الجلسة
      validateSession: async () => {
        const { sessionToken, user } = get();

        if (!sessionToken) {
          return false;
        }

        try {
          // Check if we're in Electron environment
          const isElectron = window.require && window.require('electron');
          const { ipcRenderer } = isElectron ? window.require('electron') : { ipcRenderer: null };

          if (ipcRenderer && isElectron) {
            // وضع سطح المكتب
            const result = await ipcRenderer.invoke('auth-validate-session', sessionToken);

            if (result.isValid) {
              set({
                user: result.user,
                isAuthenticated: true
              });
              return true;
            } else {
              // جلسة غير صالحة، تنظيف البيانات
              set({
                user: null,
                sessionToken: null,
                isAuthenticated: false
              });
              return false;
            }
          } else {
            // وضع الويب - التحقق من الجلسة المحلية
            if (sessionToken.startsWith('web-session-') && user) {
              set({
                user: user,
                isAuthenticated: true
              });
              return true;
            } else {
              set({
                user: null,
                sessionToken: null,
                isAuthenticated: false
              });
              return false;
            }
          }
        } catch (error) {
          console.error('خطأ في التحقق من الجلسة:', error);
          return false;
        }
      },

      // تسجيل الخروج
      logout: async () => {
        const { sessionToken } = get();
        
        try {
          // Check if we're in Electron environment
          const isElectron = window.require && window.require('electron');
          const { ipcRenderer } = isElectron ? window.require('electron') : { ipcRenderer: null };
          
          if (ipcRenderer && isElectron && sessionToken) {
            await ipcRenderer.invoke('auth-logout', sessionToken);
          }
        } catch (error) {
          console.error('خطأ في تسجيل الخروج:', error);
        }

        // تنظيف البيانات المحلية
        set({
          user: null,
          sessionToken: null,
          isAuthenticated: false,
          error: null
        });
      },

      // التحقق من الصلاحيات
      hasPermission: (permission) => {
        const { user } = get();
        
        if (!user) return false;
        
        // المدير له جميع الصلاحيات
        if (user.role === 'admin') return true;
        
        // صلاحيات المستخدم العادي
        const userPermissions = [
          'view_dashboard',
          'manage_products',
          'manage_sales',
          'view_reports',
          'manage_settings'
        ];
        
        return userPermissions.includes(permission);
      },

      // التحقق من كون المستخدم أدمن
      isAdmin: () => {
        const { user } = get();
        return user?.role === 'admin';
      },

      // التحقق من كون المستخدم مفعل
      isActive: () => {
        const { user } = get();
        return user?.isActive === true;
      },

      // الحصول على معلومات المستخدم
      getUserInfo: () => {
        const { user } = get();
        return user;
      },

      // تحديث معلومات المستخدم
      updateUser: (updatedUser) => {
        set({ user: updatedUser });
      },

      // إعادة تعيين الحالة
      reset: () => {
        set({
          user: null,
          sessionToken: null,
          isAuthenticated: false,
          isLoading: false,
          error: null
        });
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        sessionToken: state.sessionToken,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
);

export default useAuthStore;
