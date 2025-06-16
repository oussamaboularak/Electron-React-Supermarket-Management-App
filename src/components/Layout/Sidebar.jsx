import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Home,
  Package,
  ShoppingCart,
  BarChart3,
  Settings,
  X,
  Shield,
  Users,
  Key,
  Plus
} from 'lucide-react';
import { cn } from '../../utils/helpers';
import LogoutButton from '../Auth/LogoutButton';
import useAuthStore from '../../store/useAuthStore';

const Sidebar = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const { user, isAdmin } = useAuthStore();

  // تحديد التنقل حسب دور المستخدم
  const navigation = isAdmin() ? [
    // صفحات المدير فقط
    {
      name: 'لوحة التحكم',
      href: '/admin/dashboard',
      icon: Home,
      current: location.pathname === '/admin' || location.pathname === '/admin/dashboard',
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-100 dark:bg-purple-900/20'
    },
    {
      name: 'إدارة المستخدمين',
      href: '/admin/users',
      icon: Users,
      current: location.pathname === '/admin/users',
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20'
    },
    {
      name: 'إدارة التراخيص',
      href: '/admin/licenses',
      icon: Key,
      current: location.pathname === '/admin/licenses',
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/20'
    },
    {
      name: 'إنشاء ترخيص',
      href: '/admin/licenses/create',
      icon: Plus,
      current: location.pathname === '/admin/licenses/create',
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-100 dark:bg-emerald-900/20'
    },
  ] : [
    // صفحات المستخدم العادي فقط
    {
      name: 'لوحة التحكم',
      href: '/dashboard',
      icon: Home,
      current: location.pathname === '/' || location.pathname === '/dashboard',
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20',
      description: 'نظرة عامة على أداء المتجر'
    },
    {
      name: 'المنتجات',
      href: '/products',
      icon: Package,
      current: location.pathname === '/products',
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/20',
      description: 'إدارة مخزون المنتجات'
    },
    {
      name: 'المبيعات',
      href: '/sales',
      icon: ShoppingCart,
      current: location.pathname === '/sales',
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-100 dark:bg-purple-900/20',
      description: 'تسجيل وإدارة المبيعات'
    },
    {
      name: 'التقارير',
      href: '/reports',
      icon: BarChart3,
      current: location.pathname === '/reports',
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-100 dark:bg-orange-900/20',
      description: 'تقارير الأرباح والمبيعات'
    },
    {
      name: 'الإعدادات',
      href: '/settings',
      icon: Settings,
      current: location.pathname === '/settings',
      color: 'text-gray-600 dark:text-gray-400',
      bgColor: 'bg-gray-100 dark:bg-gray-900/20',
      description: 'إعدادات المتجر والحساب'
    },
  ];

  return (
    <>
      {/* Desktop sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 rtl:left-auto rtl:right-0 z-50 flex flex-col transition-all duration-300",
        "bg-white dark:bg-gray-800 border-r rtl:border-r-0 rtl:border-l border-gray-200 dark:border-gray-700",
        isOpen ? "w-64" : "w-16",
        "hidden lg:flex"
      )}>
        {/* Logo */}
        <div className="flex items-center justify-center h-20 px-4 border-b border-gray-200 dark:border-gray-700">
          {isOpen ? (
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center shadow-lg",
                isAdmin()
                  ? "bg-gradient-to-br from-purple-500 to-indigo-600"
                  : "bg-gradient-to-br from-blue-500 to-cyan-600"
              )}>
                <span className="text-white font-bold text-lg">
                  {isAdmin() ? '👑' : 'M'}
                </span>
              </div>
              <div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  Market Manager
                </div>
                <div className={cn(
                  "text-xs font-medium",
                  isAdmin()
                    ? "text-purple-600 dark:text-purple-400"
                    : "text-blue-600 dark:text-blue-400"
                )}>
                  {isAdmin() ? 'لوحة الإدارة' : 'نظام إدارة المتجر'}
                </div>
              </div>
            </div>
          ) : (
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center shadow-lg",
              isAdmin()
                ? "bg-gradient-to-br from-purple-500 to-indigo-600"
                : "bg-gradient-to-br from-blue-500 to-cyan-600"
            )}>
              <span className="text-white font-bold text-lg">
                {isAdmin() ? '👑' : 'M'}
              </span>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) => cn(
                  "group flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200 relative overflow-hidden",
                  isActive
                    ? `${item.bgColor} ${item.color} shadow-sm`
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50",
                  !isOpen && "justify-center px-2"
                )}
              >
                {/* Background gradient for active state */}
                {item.current && isOpen && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-50"></div>
                )}

                <Icon
                  size={isOpen ? 20 : 24}
                  className={cn(
                    "flex-shrink-0 relative z-10",
                    isOpen ? "mr-3 rtl:mr-0 rtl:ml-3" : "",
                    item.current ? item.color : ""
                  )}
                />

                {isOpen && (
                  <div className="flex-1 relative z-10">
                    <div className="truncate font-medium">{item.name}</div>
                    {item.description && !isAdmin() && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                        {item.description}
                      </div>
                    )}
                  </div>
                )}

                {/* Active indicator */}
                {item.current && (
                  <div className={cn(
                    "absolute right-0 rtl:right-auto rtl:left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 rounded-l-full rtl:rounded-l-none rtl:rounded-r-full",
                    item.color.replace('text-', 'bg-')
                  )}></div>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* User Info & Logout */}
        <div className="border-t border-gray-200 dark:border-gray-700">
          {isOpen ? (
            <div className="p-4">
              <LogoutButton variant="dropdown" showUserInfo={true} />
            </div>
          ) : (
            <div className="p-2 flex justify-center">
              <LogoutButton variant="minimal" />
            </div>
          )}
        </div>

        {/* Footer */}
        {isOpen && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="text-center">
              <div className="text-xs font-medium text-gray-900 dark:text-white mb-1">
                Market Manager
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                الإصدار 1.0.0
              </div>
              <div className={cn(
                "text-xs font-medium mt-2 px-2 py-1 rounded-full",
                isAdmin()
                  ? "bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400"
                  : "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
              )}>
                {isAdmin() ? '🛡️ وضع المدير' : '👤 وضع المستخدم'}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile sidebar */}
      <div className={cn(
        "fixed inset-0 z-50 lg:hidden",
        isOpen ? "block" : "hidden"
      )}>
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
        
        <div className={cn(
          "fixed inset-y-0 left-0 rtl:left-auto rtl:right-0 w-64 bg-white dark:bg-gray-800",
          "border-r rtl:border-r-0 rtl:border-l border-gray-200 dark:border-gray-700",
          "flex flex-col"
        )}>
          {/* Header with close button */}
          <div className="flex items-center justify-between h-20 px-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center shadow-lg",
                isAdmin()
                  ? "bg-gradient-to-br from-purple-500 to-indigo-600"
                  : "bg-gradient-to-br from-blue-500 to-cyan-600"
              )}>
                <span className="text-white font-bold text-lg">
                  {isAdmin() ? '👑' : 'M'}
                </span>
              </div>
              <div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  Market Manager
                </div>
                <div className={cn(
                  "text-xs font-medium",
                  isAdmin()
                    ? "text-purple-600 dark:text-purple-400"
                    : "text-blue-600 dark:text-blue-400"
                )}>
                  {isAdmin() ? 'لوحة الإدارة' : 'نظام إدارة المتجر'}
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 py-4 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  onClick={onClose}
                  className={({ isActive }) => cn(
                    "group flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200 relative overflow-hidden",
                    isActive
                      ? `${item.bgColor} ${item.color} shadow-sm`
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50"
                  )}
                >
                  {/* Background gradient for active state */}
                  {item.current && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-50"></div>
                  )}

                  <Icon
                    size={20}
                    className={cn(
                      "mr-3 rtl:mr-0 rtl:ml-3 flex-shrink-0 relative z-10",
                      item.current ? item.color : ""
                    )}
                  />

                  <div className="flex-1 relative z-10">
                    <div className="truncate font-medium">{item.name}</div>
                    {item.description && !isAdmin() && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                        {item.description}
                      </div>
                    )}
                  </div>

                  {/* Active indicator */}
                  {item.current && (
                    <div className={cn(
                      "absolute right-0 rtl:right-auto rtl:left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 rounded-l-full rtl:rounded-l-none rtl:rounded-r-full",
                      item.color.replace('text-', 'bg-')
                    )}></div>
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* User Info & Logout */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-4">
            <LogoutButton variant="dropdown" showUserInfo={true} />
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
              Market Manager v1.0.0
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
