import React, { useState } from 'react';
import { LogOut, User, Shield, Loader } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

import useAuthStore from '../../store/useAuthStore';

const LogoutButton = ({ variant = 'default', showUserInfo = true }) => {
  const navigate = useNavigate();
  const { user, logout, isLoading } = useAuthStore();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);
    
    try {
      await logout();
      toast.success('تم تسجيل الخروج بنجاح');
      navigate('/login');
    } catch (error) {
      toast.error('خطأ في تسجيل الخروج');
      console.error('Logout error:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'minimal':
        return 'p-2 text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors duration-200';
      case 'danger':
        return 'bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl';
      case 'outline':
        return 'border border-red-500 text-red-500 hover:bg-red-500 hover:text-white px-4 py-2 rounded-lg font-medium transition-all duration-200';
      default:
        return 'bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl';
    }
  };

  const getUserRoleIcon = () => {
    if (user?.role === 'admin') {
      return <Shield size={16} className="text-purple-500" />;
    }
    return <User size={16} className="text-blue-500" />;
  };

  const getUserRoleText = () => {
    if (user?.role === 'admin') {
      return 'مدير';
    }
    return 'مستخدم';
  };

  if (variant === 'dropdown') {
    return (
      <div className="relative group">
        {/* User Info Button */}
        <button className="flex items-center space-x-3 rtl:space-x-reverse p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 w-full">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            {getUserRoleIcon()}
          </div>
          {showUserInfo && (
            <div className="flex-1 text-left rtl:text-right">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {user?.fullName || 'مستخدم'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {getUserRoleText()}
              </p>
            </div>
          )}
        </button>

        {/* Dropdown Menu */}
        <div className="absolute bottom-full left-0 right-0 mb-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
          <div className="p-3 border-b border-gray-200 dark:border-gray-700">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {user?.fullName || 'مستخدم'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {user?.email}
            </p>
          </div>
          
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full flex items-center space-x-2 rtl:space-x-reverse p-3 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors duration-200 disabled:opacity-50"
          >
            {isLoggingOut ? (
              <Loader size={16} className="animate-spin" />
            ) : (
              <LogOut size={16} />
            )}
            <span className="text-sm">تسجيل الخروج</span>
          </button>
        </div>
      </div>
    );
  }

  if (variant === 'minimal') {
    return (
      <button
        onClick={handleLogout}
        disabled={isLoggingOut}
        className={getVariantStyles()}
        title="تسجيل الخروج"
      >
        {isLoggingOut ? (
          <Loader size={20} className="animate-spin" />
        ) : (
          <LogOut size={20} />
        )}
      </button>
    );
  }

  return (
    <button
      onClick={handleLogout}
      disabled={isLoggingOut}
      className={`flex items-center space-x-2 rtl:space-x-reverse ${getVariantStyles()} disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {isLoggingOut ? (
        <>
          <Loader size={16} className="animate-spin" />
          <span>جاري تسجيل الخروج...</span>
        </>
      ) : (
        <>
          <LogOut size={16} />
          <span>تسجيل الخروج</span>
        </>
      )}
    </button>
  );
};

export default LogoutButton;
