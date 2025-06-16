import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader, Shield, AlertTriangle } from 'lucide-react';

import useAuthStore from '../../store/useAuthStore';

const ProtectedRoute = ({ 
  children, 
  requireAuth = true, 
  requireAdmin = false,
  fallbackPath = '/login' 
}) => {
  const location = useLocation();
  const { 
    isAuthenticated, 
    user, 
    validateSession, 
    isAdmin,
    isActive 
  } = useAuthStore();
  
  const [isValidating, setIsValidating] = useState(true);
  const [validationComplete, setValidationComplete] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      setIsValidating(true);
      
      try {
        // التحقق من الجلسة إذا كان المستخدم مسجل دخول
        if (isAuthenticated) {
          await validateSession();
        }
      } catch (error) {
        console.error('خطأ في التحقق من المصادقة:', error);
      } finally {
        setIsValidating(false);
        setValidationComplete(true);
      }
    };

    checkAuth();
  }, [isAuthenticated, validateSession]);

  // عرض شاشة التحميل أثناء التحقق
  if (isValidating || !validationComplete) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full mb-4">
            <Loader size={32} className="text-blue-600 dark:text-blue-400 animate-spin" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            جاري التحقق من الهوية
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            يرجى الانتظار...
          </p>
        </div>
      </div>
    );
  }

  // التحقق من المصادقة المطلوبة
  if (requireAuth && !isAuthenticated) {
    return (
      <Navigate 
        to={fallbackPath} 
        state={{ from: location.pathname }} 
        replace 
      />
    );
  }

  // التحقق من تفعيل الحساب
  if (requireAuth && isAuthenticated && !isActive()) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full mb-4">
              <AlertTriangle size={32} className="text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              الحساب غير مفعل
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              تم إيقاف حسابك. يرجى التواصل مع المدير لإعادة التفعيل.
            </p>
            <button
              onClick={() => window.location.href = '/login'}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
            >
              العودة لتسجيل الدخول
            </button>
          </div>
        </div>
      </div>
    );
  }

  // التحقق من صلاحيات الأدمن
  if (requireAdmin && !isAdmin()) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 dark:bg-yellow-900 rounded-full mb-4">
              <Shield size={32} className="text-yellow-600 dark:text-yellow-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              غير مصرح لك
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              هذه الصفحة مخصصة للمديرين فقط. ليس لديك الصلاحيات المطلوبة للوصول إليها.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => window.history.back()}
                className="w-full bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
              >
                العودة للخلف
              </button>
              <button
                onClick={() => window.location.href = '/dashboard'}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
              >
                الذهاب للوحة التحكم
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // إذا كان المستخدم مسجل دخول ويحاول الوصول لصفحات المصادقة
  if (!requireAuth && isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  // عرض المحتوى إذا تم تمرير جميع الفحوصات
  return children;
};

// مكون للتحقق من الصلاحيات داخل الصفحات
export const PermissionGuard = ({ 
  permission, 
  children, 
  fallback = null,
  requireAdmin = false 
}) => {
  const { hasPermission, isAdmin } = useAuthStore();

  // التحقق من صلاحيات الأدمن
  if (requireAdmin && !isAdmin()) {
    return fallback;
  }

  // التحقق من الصلاحية المحددة
  if (permission && !hasPermission(permission)) {
    return fallback;
  }

  return children;
};

// مكون لعرض محتوى مختلف حسب الدور
export const RoleBasedComponent = ({ 
  adminComponent, 
  userComponent, 
  guestComponent = null 
}) => {
  const { isAuthenticated, isAdmin } = useAuthStore();

  if (!isAuthenticated) {
    return guestComponent;
  }

  if (isAdmin()) {
    return adminComponent;
  }

  return userComponent;
};

export default ProtectedRoute;
