import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Settings as SettingsIcon,
  Globe,
  Moon,
  Sun,
  Download,
  Upload,
  Save,
  Store,
  DollarSign,
  Percent,
  Shield,
  Key,
  Calendar,
  Info,
  Database,
  Palette,
  User,
  Phone,
  MapPin,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  HelpCircle,
  ExternalLink,
  Copy,
  Eye,
  EyeOff
} from 'lucide-react';
import toast from 'react-hot-toast';

import useAppStore from '../store/useAppStore';
import { exportData, importData, getDbPath, openDbLocation } from '../utils/database';
import LicenseDetailsModal from '../components/License/LicenseDetailsModal';
import { useLicense } from '../components/License/LicenseProvider';

const Settings = () => {
  const { t, i18n } = useTranslation();
  const {
    theme,
    setTheme,
    language,
    setLanguage,
    settings,
    updateSettings
  } = useAppStore();
  const { showLicenseBar, handleShowLicenseBar } = useLicense();

  const [formData, setFormData] = useState({
    storeName: '',
    storeAddress: '',
    storePhone: '',
    currency: 'USD',
    taxRate: 0,
  });

  const [loading, setLoading] = useState(false);
  const [dbPath, setDbPath] = useState('');
  const [showLicenseModal, setShowLicenseModal] = useState(false);
  const [licenseInfo, setLicenseInfo] = useState(null);
  const [activeTab, setActiveTab] = useState('general');
  const [showLicenseKey, setShowLicenseKey] = useState(false);
  const [saveStatus, setSaveStatus] = useState('idle'); // idle, saving, saved, error

  useEffect(() => {
    setFormData({
      storeName: settings.storeName || '',
      storeAddress: settings.storeAddress || '',
      storePhone: settings.storePhone || '',
      currency: settings.currency || 'USD',
      taxRate: settings.taxRate || 0,
    });
  }, [settings]);

  useEffect(() => {
    // Get database path on component mount
    const fetchDbPath = async () => {
      const path = await getDbPath();
      setDbPath(path);
    };
    fetchDbPath();
  }, []);

  useEffect(() => {
    // Get license information on component mount
    const fetchLicenseInfo = async () => {
      const { ipcRenderer } = window.require ? window.require('electron') : { ipcRenderer: null };
      if (ipcRenderer) {
        try {
          const result = await ipcRenderer.invoke('get-license-info');
          setLicenseInfo(result);
        } catch (error) {
          console.error('Error fetching license info:', error);
        }
      }
    };
    fetchLicenseInfo();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveSettings = async () => {
    setSaveStatus('saving');
    setLoading(true);
    try {
      await updateSettings(formData);
      setSaveStatus('saved');
      toast.success(t('settings.settingsSaved'));

      // Reset save status after 2 seconds
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setSaveStatus('error');
      toast.error(t('errors.generalError'));

      // Reset save status after 3 seconds
      setTimeout(() => setSaveStatus('idle'), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage);
    i18n.changeLanguage(newLanguage);
    toast.success('Language changed successfully');
  };

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    toast.success(`Switched to ${newTheme} mode`);
  };

  const handleExportData = async (format) => {
    setLoading(true);
    try {
      const result = await exportData(format);
      if (result.success) {
        toast.success(t('settings.dataExported'));
      } else {
        toast.error(result.error || t('errors.generalError'));
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error(t('errors.generalError'));
    } finally {
      setLoading(false);
    }
  };

  const handleImportData = async () => {
    setLoading(true);
    try {
      const result = await importData();
      if (result.success) {
        toast.success(t('settings.dataImported'));
        // Refresh the page to reload data
        window.location.reload();
      } else {
        toast.error(result.error || t('errors.generalError'));
      }
    } catch (error) {
      console.error('Import error:', error);
      toast.error(t('errors.generalError'));
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDbLocation = async () => {
    const result = await openDbLocation();
    if (result.success) {
      toast.success('Database location opened');
    } else {
      toast.error(result.error || 'Cannot open location in browser mode');
    }
  };

  const handleOpenLicenseDetails = () => {
    setShowLicenseModal(true);
  };

  const handleLicenseUpdated = (updatedLicense) => {
    setLicenseInfo(updatedLicense);
    toast.success('تم تحديث الترخيص بنجاح!');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'غير محدد';
    try {
      return new Date(dateString).toLocaleDateString('ar-SA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return 'تاريخ غير صحيح';
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('تم نسخ النص');
    } catch (error) {
      toast.error('فشل في نسخ النص');
    }
  };

  const getSaveButtonContent = () => {
    switch (saveStatus) {
      case 'saving':
        return (
          <>
            <RefreshCw size={16} className="animate-spin" />
            <span>جاري الحفظ...</span>
          </>
        );
      case 'saved':
        return (
          <>
            <CheckCircle size={16} />
            <span>تم الحفظ</span>
          </>
        );
      case 'error':
        return (
          <>
            <AlertTriangle size={16} />
            <span>خطأ في الحفظ</span>
          </>
        );
      default:
        return (
          <>
            <Save size={16} />
            <span>{t('settings.saveSettings')}</span>
          </>
        );
    }
  };

  const currencies = [
    { code: 'USD', name: 'US Dollar ($)' },
    { code: 'EUR', name: 'Euro (€)' },
    { code: 'GBP', name: 'British Pound (£)' },
    { code: 'SAR', name: 'Saudi Riyal (ر.س)' },
    { code: 'AED', name: 'UAE Dirham (د.إ)' },
    { code: 'EGP', name: 'Egyptian Pound (ج.م)' },
    { code: 'TRY', name: 'Turkish Lira (₺)' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Enhanced Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                <SettingsIcon size={28} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {t('settings.title')}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  إدارة إعدادات التطبيق والمتجر بشكل شامل
                </p>
              </div>
            </div>

            {/* Save Status Indicator */}
            {saveStatus !== 'idle' && (
              <div className={`flex items-center space-x-2 rtl:space-x-reverse px-4 py-2 rounded-full text-sm font-medium shadow-sm ${
                saveStatus === 'saved' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                saveStatus === 'saving' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' :
                'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
              }`}>
                {getSaveButtonContent()}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">

        {/* General Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <div className="p-2 bg-blue-500 rounded-lg">
                <Palette size={20} className="text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  المظهر واللغة
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  تخصيص مظهر التطبيق واللغة المفضلة
                </p>
              </div>
            </div>
          </div>

          <div className="p-8 space-y-8">
            {/* Language Settings */}
            <div>
              <div className="flex items-center space-x-3 rtl:space-x-reverse mb-4">
                <Globe size={20} className="text-blue-500" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {t('settings.language')}
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={() => handleLanguageChange('en')}
                  className={`group relative p-6 rounded-xl border-2 transition-all duration-200 hover:shadow-lg ${
                    language === 'en'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg'
                      : 'border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-3xl mb-3">🇺🇸</div>
                    <div className="font-semibold text-gray-900 dark:text-white">English</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Left to Right
                    </div>
                  </div>
                  {language === 'en' && (
                    <div className="absolute top-3 right-3">
                      <CheckCircle size={20} className="text-blue-500" />
                    </div>
                  )}
                </button>

                <button
                  onClick={() => handleLanguageChange('ar')}
                  className={`group relative p-6 rounded-xl border-2 transition-all duration-200 hover:shadow-lg ${
                    language === 'ar'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg'
                      : 'border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-3xl mb-3">🇸🇦</div>
                    <div className="font-semibold text-gray-900 dark:text-white">العربية</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      من اليمين إلى اليسار
                    </div>
                  </div>
                  {language === 'ar' && (
                    <div className="absolute top-3 right-3">
                      <CheckCircle size={20} className="text-blue-500" />
                    </div>
                  )}
                </button>
              </div>
            </div>

            {/* Theme Settings */}
            <div>
              <div className="flex items-center space-x-3 rtl:space-x-reverse mb-4">
                {theme === 'light' ?
                  <Sun size={20} className="text-yellow-500" /> :
                  <Moon size={20} className="text-indigo-500" />
                }
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {t('settings.theme')}
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={() => handleThemeChange('light')}
                  className={`group relative p-6 rounded-xl border-2 transition-all duration-200 hover:shadow-lg ${
                    theme === 'light'
                      ? 'border-yellow-400 bg-yellow-50 shadow-lg'
                      : 'border-gray-200 dark:border-gray-600 hover:border-yellow-300'
                  }`}
                >
                  <div className="text-center">
                    <Sun size={32} className={`mx-auto mb-3 ${theme === 'light' ? 'text-yellow-500' : 'text-gray-400'}`} />
                    <div className="font-semibold text-gray-900">الوضع الفاتح</div>
                    <div className="text-sm text-gray-500 mt-1">
                      مناسب للاستخدام النهاري
                    </div>
                  </div>
                  {theme === 'light' && (
                    <div className="absolute top-3 right-3">
                      <CheckCircle size={20} className="text-yellow-500" />
                    </div>
                  )}
                </button>

                <button
                  onClick={() => handleThemeChange('dark')}
                  className={`group relative p-6 rounded-xl border-2 transition-all duration-200 hover:shadow-lg ${
                    theme === 'dark'
                      ? 'border-indigo-400 bg-indigo-900/20 shadow-lg'
                      : 'border-gray-200 dark:border-gray-600 hover:border-indigo-300 dark:hover:border-indigo-500'
                  }`}
                >
                  <div className="text-center">
                    <Moon size={32} className={`mx-auto mb-3 ${theme === 'dark' ? 'text-indigo-400' : 'text-gray-400 dark:text-gray-500'}`} />
                    <div className="font-semibold text-gray-900 dark:text-white">الوضع المظلم</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      مريح للعينين ليلاً
                    </div>
                  </div>
                  {theme === 'dark' && (
                    <div className="absolute top-3 right-3">
                      <CheckCircle size={20} className="text-indigo-400" />
                    </div>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Store Information */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <div className="p-2 bg-green-500 rounded-lg">
                <Store size={20} className="text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  معلومات المتجر
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  إعدادات المتجر والعملة والضرائب
                </p>
              </div>
            </div>
          </div>

          <div className="p-8 space-y-6">
            {/* Store Basic Info */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="flex items-center space-x-2 rtl:space-x-reverse text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  <Store size={16} className="text-green-500" />
                  <span>{t('settings.storeName')}</span>
                </label>
                <input
                  type="text"
                  name="storeName"
                  value={formData.storeName}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="اسم المتجر"
                />
              </div>

              <div>
                <label className="flex items-center space-x-2 rtl:space-x-reverse text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  <Phone size={16} className="text-green-500" />
                  <span>{t('settings.storePhone')}</span>
                </label>
                <input
                  type="tel"
                  name="storePhone"
                  value={formData.storePhone}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="رقم الهاتف"
                />
              </div>
            </div>

            <div>
              <label className="flex items-center space-x-2 rtl:space-x-reverse text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                <MapPin size={16} className="text-green-500" />
                <span>{t('settings.storeAddress')}</span>
              </label>
              <textarea
                name="storeAddress"
                value={formData.storeAddress}
                onChange={handleInputChange}
                rows={3}
                className="form-input"
                placeholder="عنوان المتجر الكامل"
              />
            </div>

            {/* Currency and Tax Settings */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="flex items-center space-x-2 rtl:space-x-reverse text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  <DollarSign size={16} className="text-green-500" />
                  <span>{t('settings.currency')}</span>
                </label>
                <select
                  name="currency"
                  value={formData.currency}
                  onChange={handleInputChange}
                  className="form-input"
                >
                  {currencies.map(currency => (
                    <option key={currency.code} value={currency.code}>
                      {currency.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  العملة المستخدمة في جميع المعاملات والتقارير
                </p>
              </div>

              <div>
                <label className="flex items-center space-x-2 rtl:space-x-reverse text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  <Percent size={16} className="text-green-500" />
                  <span>{t('settings.taxRate')}</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    name="taxRate"
                    value={formData.taxRate}
                    onChange={handleInputChange}
                    className="form-input pr-8"
                    placeholder="0"
                    min="0"
                    max="100"
                    step="0.1"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <span className="text-gray-500 text-sm">%</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  نسبة الضريبة المضافة على المبيعات
                </p>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={handleSaveSettings}
                disabled={loading || saveStatus === 'saving'}
                className={`flex items-center space-x-2 rtl:space-x-reverse px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  saveStatus === 'saved'
                    ? 'bg-green-500 text-white shadow-lg'
                    : saveStatus === 'error'
                    ? 'bg-red-500 text-white'
                    : 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg hover:shadow-xl'
                } ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
              >
                {getSaveButtonContent()}
              </button>
            </div>
          </div>
        </div>

        {/* License Management */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <div className="p-2 bg-purple-500 rounded-lg">
                <Shield size={20} className="text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  إدارة الترخيص
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  عرض وإدارة معلومات ترخيص التطبيق
                </p>
              </div>
            </div>
          </div>

        <div className="p-6">
          {licenseInfo ? (
            <div className="space-y-4">
              {/* License Status */}
              <div className={`p-4 rounded-lg border-2 ${
                (licenseInfo.daysRemaining || 0) <= 7
                  ? 'border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800'
                  : 'border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 rtl:space-x-reverse">
                    <Shield size={20} className={
                      (licenseInfo.daysRemaining || 0) <= 7
                        ? 'text-yellow-600 dark:text-yellow-400'
                        : 'text-green-600 dark:text-green-400'
                    } />
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        حالة الترخيص
                      </h3>
                      <p className={`text-sm ${
                        (licenseInfo.daysRemaining || 0) <= 7
                          ? 'text-yellow-700 dark:text-yellow-300'
                          : 'text-green-700 dark:text-green-300'
                      }`}>
                        {(licenseInfo.daysRemaining || 0) <= 7
                          ? 'ينتهي قريباً - يحتاج تجديد'
                          : 'نشط وصالح'
                        }
                      </p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    (licenseInfo.daysRemaining || 0) <= 3
                      ? 'text-red-600 bg-red-100 dark:bg-red-900/20'
                      : (licenseInfo.daysRemaining || 0) <= 7
                      ? 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20'
                      : 'text-green-600 bg-green-100 dark:bg-green-900/20'
                  }`}>
                    {licenseInfo.daysRemaining || 0} يوم متبقي
                  </span>
                </div>
              </div>

              {/* License Information Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <Key size={16} className="text-purple-500" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        مفتاح الترخيص
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <button
                        onClick={() => setShowLicenseKey(!showLicenseKey)}
                        className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        title={showLicenseKey ? 'إخفاء المفتاح' : 'إظهار المفتاح'}
                      >
                        {showLicenseKey ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                      <button
                        onClick={() => copyToClipboard(licenseInfo.licenseKey || '')}
                        className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        title="نسخ المفتاح"
                        disabled={!licenseInfo.licenseKey}
                      >
                        <Copy size={14} />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs font-mono text-gray-600 dark:text-gray-400 break-all">
                    {showLicenseKey
                      ? (licenseInfo.licenseKey || 'غير متوفر')
                      : (licenseInfo.licenseKey ? licenseInfo.licenseKey.replace(/./g, '•').substring(0, 20) + '...' : 'غير متوفر')
                    }
                  </p>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center space-x-2 rtl:space-x-reverse mb-2">
                    <Calendar size={16} className="text-gray-400" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      تاريخ الانتهاء
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {formatDate(licenseInfo.expiresAt)}
                  </p>
                </div>

                {licenseInfo.customerName && (
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-2 rtl:space-x-reverse mb-2">
                      <Info size={16} className="text-gray-400" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        اسم العميل
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {licenseInfo.customerName}
                    </p>
                  </div>
                )}

                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center space-x-2 rtl:space-x-reverse mb-2">
                    <Calendar size={16} className="text-gray-400" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      تاريخ التفعيل
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {licenseInfo.activatedAt ? formatDate(licenseInfo.activatedAt) : 'غير محدد'}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={handleOpenLicenseDetails}
                  className="flex-1 bg-purple-500 hover:bg-purple-600 text-white px-4 py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2 rtl:space-x-reverse shadow-lg hover:shadow-xl"
                >
                  <Shield size={16} />
                  <span>عرض التفاصيل الكاملة</span>
                </button>

                {!showLicenseBar && (
                  <button
                    onClick={handleShowLicenseBar}
                    className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-4 py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2 rtl:space-x-reverse shadow-lg hover:shadow-xl"
                  >
                    <Eye size={16} />
                    <span>إظهار شريط الترخيص</span>
                  </button>
                )}

                <button
                  onClick={() => window.open('https://example.com/support', '_blank')}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2 rtl:space-x-reverse shadow-lg hover:shadow-xl"
                >
                  <HelpCircle size={16} />
                  <span>الدعم الفني</span>
                  <ExternalLink size={14} />
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Shield size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                لا يوجد ترخيص مفعل
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                يرجى تفعيل ترخيص صالح لاستخدام التطبيق
              </p>
              <button
                onClick={() => window.location.reload()}
                className="btn-primary"
              >
                إعادة تحميل التطبيق
              </button>
            </div>
          )}
        </div>
      </div>

        {/* Data Management */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <div className="p-2 bg-orange-500 rounded-lg">
                <Database size={20} className="text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  إدارة البيانات
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  تصدير واستيراد بيانات المتجر للنسخ الاحتياطي
                </p>
              </div>
            </div>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="group">
                <button
                  onClick={() => handleExportData('json')}
                  disabled={loading}
                  className="w-full p-6 bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all duration-200 group-hover:shadow-lg"
                >
                  <Download size={32} className="mx-auto text-blue-500 mb-3" />
                  <div className="font-semibold text-gray-900 dark:text-white mb-1">
                    تصدير JSON
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    تصدير جميع البيانات بصيغة JSON
                  </div>
                </button>
              </div>

              <div className="group">
                <button
                  onClick={() => handleExportData('csv')}
                  disabled={loading}
                  className="w-full p-6 bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800 rounded-xl hover:bg-green-100 dark:hover:bg-green-900/30 transition-all duration-200 group-hover:shadow-lg"
                >
                  <Download size={32} className="mx-auto text-green-500 mb-3" />
                  <div className="font-semibold text-gray-900 dark:text-white mb-1">
                    تصدير CSV
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    تصدير المنتجات بصيغة CSV
                  </div>
                </button>
              </div>

              <div className="group">
                <button
                  onClick={handleImportData}
                  disabled={loading}
                  className="w-full p-6 bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-200 dark:border-purple-800 rounded-xl hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-all duration-200 group-hover:shadow-lg"
                >
                  <Upload size={32} className="mx-auto text-purple-500 mb-3" />
                  <div className="font-semibold text-gray-900 dark:text-white mb-1">
                    استيراد JSON
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    استيراد البيانات من ملف JSON
                  </div>
                </button>
              </div>
            </div>

            <div className="mt-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl">
              <div className="flex items-start space-x-3 rtl:space-x-reverse">
                <AlertTriangle size={20} className="text-yellow-600 dark:text-yellow-400 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-1">
                    تحذير مهم
                  </h4>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    استيراد البيانات سيؤدي إلى استبدال البيانات الحالية. تأكد من عمل نسخة احتياطية قبل الاستيراد.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Database Information */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-900/20 dark:to-slate-900/20 p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <div className="p-2 bg-gray-500 rounded-lg">
                <Database size={20} className="text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  معلومات قاعدة البيانات
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  معلومات حول مكان تخزين البيانات
                </p>
              </div>
            </div>
          </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Database Location:
            </label>
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <input
                type="text"
                value={dbPath}
                readOnly
                className="form-input flex-1 bg-gray-50 dark:bg-gray-700 cursor-default"
                placeholder="Loading database path..."
              />
              {dbPath && !dbPath.includes('localStorage') && (
                <button
                  onClick={handleOpenDbLocation}
                  className="btn-secondary whitespace-nowrap"
                >
                  Open Location
                </button>
              )}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {dbPath.includes('localStorage')
                ? 'Data is stored in browser localStorage (development mode)'
                : 'Data is stored in a JSON file on your computer'
              }
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-sm font-medium text-blue-800 dark:text-blue-200">
                Storage Type
              </div>
              <div className="text-xs text-blue-600 dark:text-blue-300 mt-1">
                {dbPath.includes('localStorage') ? 'Browser Storage' : 'JSON File'}
              </div>
            </div>

            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="text-sm font-medium text-green-800 dark:text-green-200">
                Backup Status
              </div>
              <div className="text-xs text-green-600 dark:text-green-300 mt-1">
                Auto-saved locally
              </div>
            </div>

            <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="text-sm font-medium text-purple-800 dark:text-purple-200">
                Access Mode
              </div>
              <div className="text-xs text-purple-600 dark:text-purple-300 mt-1">
                Offline capable
              </div>
            </div>
          </div>
        </div>
      </div>

        {/* License Details Modal */}
        <LicenseDetailsModal
          isOpen={showLicenseModal}
          onClose={() => setShowLicenseModal(false)}
          currentLicense={licenseInfo}
          onLicenseUpdated={handleLicenseUpdated}
        />
        </div>
      </div>
    </div>
  );
};

export default Settings;
