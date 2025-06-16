import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Key, 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  X,
  Calendar,
  User,
  Mail
} from 'lucide-react';
import toast from 'react-hot-toast';

const { ipcRenderer } = window.require ? window.require('electron') : { ipcRenderer: null };

const LicenseModal = ({ isOpen, onLicenseValid, onClose }) => {
  const { t } = useTranslation();
  const [licenseKey, setLicenseKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [licenseInfo, setLicenseInfo] = useState(null);

  // التحقق من وجود ترخيص محفوظ عند فتح النافذة
  useEffect(() => {
    if (isOpen) {
      checkExistingLicense();
    }
  }, [isOpen]);

  const checkExistingLicense = async () => {
    if (!ipcRenderer) return;

    try {
      const result = await ipcRenderer.invoke('check-saved-license');
      if (result.isValid) {
        setLicenseInfo(result.license);
        onLicenseValid(result.license);
      }
    } catch (error) {
      console.error('Error checking existing license:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!licenseKey.trim()) {
      setError('يرجى إدخال مفتاح الترخيص');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (ipcRenderer) {
        const result = await ipcRenderer.invoke('validate-license', licenseKey.trim());
        
        if (result.isValid) {
          setLicenseInfo(result.license);
          toast.success('تم تفعيل الترخيص بنجاح!');
          onLicenseValid(result.license);
        } else {
          setError(result.error || 'مفتاح الترخيص غير صالح');
          toast.error(result.error || 'مفتاح الترخيص غير صالح');
        }
      } else {
        // وضع التطوير - قبول أي مفتاح يبدأ بـ MM-
        if (licenseKey.startsWith('MM-')) {
          const mockLicense = {
            id: 'dev-license',
            customerName: 'Developer',
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            daysRemaining: 30
          };
          setLicenseInfo(mockLicense);
          toast.success('تم تفعيل الترخيص (وضع التطوير)');
          onLicenseValid(mockLicense);
        } else {
          setError('مفتاح الترخيص يجب أن يبدأ بـ MM-');
        }
      }
    } catch (error) {
      console.error('License validation error:', error);
      setError('حدث خطأ أثناء التحقق من الترخيص');
      toast.error('حدث خطأ أثناء التحقق من الترخيص');
    } finally {
      setLoading(false);
    }
  };

  const handleClearLicense = async () => {
    if (!ipcRenderer) return;

    try {
      await ipcRenderer.invoke('clear-license');
      setLicenseInfo(null);
      setLicenseKey('');
      setError('');
      toast.success('تم حذف الترخيص');
    } catch (error) {
      console.error('Error clearing license:', error);
      toast.error('فشل في حذف الترخيص');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Shield size={24} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                تفعيل الترخيص
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Market Manager License Activation
              </p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          {licenseInfo ? (
            // عرض معلومات الترخيص المفعل
            <div className="space-y-4">
              <div className="flex items-center space-x-2 rtl:space-x-reverse text-green-600 dark:text-green-400">
                <CheckCircle size={20} />
                <span className="font-medium">الترخيص مفعل بنجاح</span>
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 space-y-3">
                {licenseInfo.customerName && (
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <User size={16} className="text-green-600 dark:text-green-400" />
                    <span className="text-sm text-green-800 dark:text-green-200">
                      العميل: {licenseInfo.customerName}
                    </span>
                  </div>
                )}

                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <Calendar size={16} className="text-green-600 dark:text-green-400" />
                  <span className="text-sm text-green-800 dark:text-green-200">
                    ينتهي في: {new Date(licenseInfo.expiresAt).toLocaleDateString('ar-SA')}
                  </span>
                </div>

                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <AlertTriangle size={16} className="text-green-600 dark:text-green-400" />
                  <span className="text-sm text-green-800 dark:text-green-200">
                    الأيام المتبقية: {licenseInfo.daysRemaining} يوم
                  </span>
                </div>
              </div>

              <div className="flex space-x-3 rtl:space-x-reverse">
                <button
                  onClick={() => onLicenseValid(licenseInfo)}
                  className="flex-1 btn-primary"
                >
                  متابعة إلى التطبيق
                </button>
                <button
                  onClick={handleClearLicense}
                  className="btn-secondary"
                >
                  تغيير الترخيص
                </button>
              </div>
            </div>
          ) : (
            // نموذج إدخال مفتاح الترخيص
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Key size={16} className="inline mr-2 rtl:mr-0 rtl:ml-2" />
                  مفتاح الترخيص
                </label>
                <input
                  type="text"
                  value={licenseKey}
                  onChange={(e) => {
                    setLicenseKey(e.target.value);
                    setError('');
                  }}
                  placeholder="MM-XXXXXXXXXXXXXXXXX"
                  className={`form-input ${error ? 'border-red-500' : ''}`}
                  disabled={loading}
                  autoFocus
                />
                {error && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center">
                    <AlertTriangle size={16} className="mr-1 rtl:mr-0 rtl:ml-1" />
                    {error}
                  </p>
                )}
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
                  معلومات مهمة:
                </h4>
                <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                  <li>• يجب أن يبدأ مفتاح الترخيص بـ MM-</li>
                  <li>• كل ترخيص صالح لمدة شهر واحد</li>
                  <li>• يمكنك الحصول على مفتاح من المطور</li>
                  <li>• لا يمكن استخدام التطبيق بدون ترخيص صالح</li>
                </ul>
              </div>

              <button
                type="submit"
                disabled={loading || !licenseKey.trim()}
                className="w-full btn-primary flex items-center justify-center space-x-2 rtl:space-x-reverse"
              >
                {loading ? (
                  <>
                    <div className="spinner" />
                    <span>جاري التحقق...</span>
                  </>
                ) : (
                  <>
                    <Shield size={16} />
                    <span>تفعيل الترخيص</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 rounded-b-lg">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Market Manager v1.0.0 - نظام إدارة السوبر ماركت
          </p>
        </div>
      </div>
    </div>
  );
};

export default LicenseModal;
