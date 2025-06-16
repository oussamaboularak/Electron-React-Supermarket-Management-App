import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Menu,
  Bell,
  Search,
  Sun,
  Moon,
  Globe,
  Shield
} from 'lucide-react';
import useAppStore from '../../store/useAppStore';
import useProductStore from '../../store/useProductStore';
import useAuthStore from '../../store/useAuthStore';
import { useLicense } from '../License/LicenseProvider';

const Header = ({ title, onMenuClick, sidebarOpen }) => {
  const { t, i18n } = useTranslation();
  const { theme, setTheme, language, setLanguage } = useAppStore();
  const { getLowStockProducts } = useProductStore();
  const { user } = useAuthStore();
  const { showLicenseBar, handleShowLicenseBar } = useLicense();

  const lowStockProducts = getLowStockProducts();

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const toggleLanguage = () => {
    const newLanguage = language === 'en' ? 'ar' : 'en';
    setLanguage(newLanguage);
    i18n.changeLanguage(newLanguage);
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between px-4 lg:px-6 py-4">
        {/* Left section */}
        <div className="flex items-center space-x-4 rtl:space-x-reverse">
          {/* Menu button */}
          <button
            onClick={onMenuClick}
            className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <Menu size={20} />
          </button>

          {/* Page title */}
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
            {title}
          </h1>
        </div>

     
      

        {/* Right section */}
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          {/* Language toggle */}
          <button
            onClick={toggleLanguage}
            className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title={t('settings.language')}
          >
            <Globe size={20} />
          </button>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title={t('settings.theme')}
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>

          {/* License Bar Toggle */}
          {!showLicenseBar && (
            <button
              onClick={handleShowLicenseBar}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="إظهار شريط الترخيص"
            >
              <Shield size={20} />
            </button>
          )}

          {/* Notifications */}
          <div className="relative">
            <button className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <Bell size={20} />
              {lowStockProducts.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {lowStockProducts.length}
                </span>
              )}
            </button>
          </div>

          {/* User menu */}
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <div className="hidden sm:block text-right rtl:text-left">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {user?.fullName || user?.username || 'مستخدم'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {user?.role === 'admin' ? 'مدير النظام' : 'مستخدم'}
              </p>
            </div>
            <div className="h-8 w-8 rounded-full bg-primary-500 flex items-center justify-center">
              <span className="text-sm font-medium text-white">
                {user?.fullName ? user.fullName.charAt(0).toUpperCase() :
                 user?.username ? user.username.charAt(0).toUpperCase() : 'M'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
