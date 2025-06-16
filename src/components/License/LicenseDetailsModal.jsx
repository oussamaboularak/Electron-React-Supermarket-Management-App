import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  X, 
  Shield, 
  Calendar, 
  User, 
  Mail, 
  Key, 
  Clock, 
  Plus,
  AlertTriangle,
  CheckCircle,
  RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';

const { ipcRenderer } = window.require ? window.require('electron') : { ipcRenderer: null };

const LicenseDetailsModal = ({ isOpen, onClose, currentLicense, onLicenseUpdated }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [extendLoading, setExtendLoading] = useState(false);
  const [newLicenseKey, setNewLicenseKey] = useState('');
  const [showExtendForm, setShowExtendForm] = useState(false);
  const [error, setError] = useState('');
  const [licenseDetails, setLicenseDetails] = useState(null);

  useEffect(() => {
    if (isOpen && currentLicense) {
      setLicenseDetails(currentLicense);
      setNewLicenseKey('');
      setShowExtendForm(false);
      setError('');
    }
  }, [isOpen, currentLicense]);

  const refreshLicenseInfo = async () => {
    if (!ipcRenderer) return;

    setLoading(true);
    try {
      const result = await ipcRenderer.invoke('get-license-info');
      if (result) {
        setLicenseDetails(result);
        if (onLicenseUpdated) {
          onLicenseUpdated(result);
        }
      }
    } catch (error) {
      console.error('Error refreshing license info:', error);
      toast.error('فشل في تحديث معلومات الترخيص');
    } finally {
      setLoading(false);
    }
  };

  const handleExtendLicense = async (e) => {
    e.preventDefault();
    
    if (!newLicenseKey.trim()) {
      setError('يرجى إدخال مفتاح الترخيص الجديد');
      return;
    }

    if (!newLicenseKey.startsWith('MM-')) {
      setError('مفتاح الترخيص يجب أن يبدأ بـ MM-');
      return;
    }

    setExtendLoading(true);
    setError('');

    try {
      if (ipcRenderer) {
        // التحقق من صحة المفتاح الجديد
        const result = await ipcRenderer.invoke('validate-license', newLicenseKey.trim());
        
        if (result.isValid) {
          // تحديث معلومات الترخيص
          await refreshLicenseInfo();
          
          toast.success('تم تمديد الترخيص بنجاح!');
          setNewLicenseKey('');
          setShowExtendForm(false);
          
          // إشعار المكون الأب بالتحديث
          if (onLicenseUpdated) {
            onLicenseUpdated(result.license);
          }
        } else {
          setError(result.error || 'مفتاح الترخيص غير صالح');
          toast.error(result.error || 'مفتاح الترخيص غير صالح');
        }
      } else {
        // وضع التطوير
        toast.success('تم تمديد الترخيص (وضع التطوير)');
        setShowExtendForm(false);
      }
    } catch (error) {
      console.error('License extension error:', error);
      setError('حدث خطأ أثناء تمديد الترخيص');
      toast.error('حدث خطأ أثناء تمديد الترخيص');
    } finally {
      setExtendLoading(false);
    }
  };

  const getStatusColor = (daysRemaining) => {
    if (daysRemaining <= 3) return 'text-red-600 bg-red-100 dark:bg-red-900/20';
    if (daysRemaining <= 7) return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
    if (daysRemaining <= 30) return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';
    return 'text-green-600 bg-green-100 dark:bg-green-900/20';
  };

  const getStatusIcon = (daysRemaining) => {
    if (daysRemaining <= 7) return <AlertTriangle size={16} />;
    return <CheckCircle size={16} />;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
  };

  if (!isOpen || !licenseDetails) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Shield size={24} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                تفاصيل الترخيص
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                License Details & Management
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <button
              onClick={refreshLicenseInfo}
              disabled={loading}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              title="تحديث المعلومات"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* License Status */}
          <div className={`p-4 rounded-lg border-2 ${
            licenseDetails.daysRemaining <= 7 
              ? 'border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800'
              : 'border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                {getStatusIcon(licenseDetails.daysRemaining)}
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    حالة الترخيص
                  </h3>
                  <p className={`text-sm ${
                    licenseDetails.daysRemaining <= 7 
                      ? 'text-yellow-700 dark:text-yellow-300'
                      : 'text-green-700 dark:text-green-300'
                  }`}>
                    {licenseDetails.daysRemaining <= 7 
                      ? 'ينتهي قريباً - يحتاج تجديد'
                      : 'نشط وصالح'
                    }
                  </p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(licenseDetails.daysRemaining)}`}>
                {licenseDetails.daysRemaining} يوم متبقي
              </span>
            </div>
          </div>

          {/* License Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Customer Info */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                معلومات العميل
              </h4>
              
              {licenseDetails.customerName && (
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  <User size={16} className="text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">اسم العميل</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {licenseDetails.customerName}
                    </p>
                  </div>
                </div>
              )}

              {licenseDetails.customerEmail && (
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  <Mail size={16} className="text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">البريد الإلكتروني</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {licenseDetails.customerEmail}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <Key size={16} className="text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">معرف الترخيص</p>
                  <p className="font-mono text-sm text-gray-900 dark:text-white break-all">
                    {licenseDetails.id}
                  </p>
                </div>
              </div>
            </div>

            {/* Date Info */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                معلومات التواريخ
              </h4>

              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <Calendar size={16} className="text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">تاريخ الإنشاء</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {formatDate(licenseDetails.createdAt)}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <Clock size={16} className="text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">تاريخ الانتهاء</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {formatDate(licenseDetails.expiresAt)}
                  </p>
                </div>
              </div>

              {licenseDetails.activatedAt && (
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  <CheckCircle size={16} className="text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">تاريخ التفعيل</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {formatDate(licenseDetails.activatedAt)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Extend License Section */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            {!showExtendForm ? (
              <div className="text-center">
                <button
                  onClick={() => setShowExtendForm(true)}
                  className="btn-primary flex items-center space-x-2 rtl:space-x-reverse mx-auto"
                >
                  <Plus size={16} />
                  <span>تمديد الترخيص</span>
                </button>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  أدخل مفتاح ترخيص جديد لتمديد المدة
                </p>
              </div>
            ) : (
              <form onSubmit={handleExtendLicense} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Key size={16} className="inline mr-2 rtl:mr-0 rtl:ml-2" />
                    مفتاح الترخيص الجديد
                  </label>
                  <input
                    type="text"
                    value={newLicenseKey}
                    onChange={(e) => {
                      setNewLicenseKey(e.target.value);
                      setError('');
                    }}
                    placeholder="MM-XXXXXXXXXXXXXXXXX"
                    className={`form-input ${error ? 'border-red-500' : ''}`}
                    disabled={extendLoading}
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
                    ملاحظة مهمة:
                  </h4>
                  <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                    <li>• سيتم استبدال الترخيص الحالي بالجديد</li>
                    <li>• تأكد من صحة المفتاح قبل الإدخال</li>
                    <li>• المفتاح الجديد يجب أن يكون صالحاً وغير منتهي</li>
                  </ul>
                </div>

                <div className="flex space-x-3 rtl:space-x-reverse">
                  <button
                    type="submit"
                    disabled={extendLoading || !newLicenseKey.trim()}
                    className="flex-1 btn-primary flex items-center justify-center space-x-2 rtl:space-x-reverse"
                  >
                    {extendLoading ? (
                      <>
                        <div className="spinner" />
                        <span>جاري التمديد...</span>
                      </>
                    ) : (
                      <>
                        <Plus size={16} />
                        <span>تمديد الترخيص</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowExtendForm(false);
                      setNewLicenseKey('');
                      setError('');
                    }}
                    className="btn-secondary"
                    disabled={extendLoading}
                  >
                    إلغاء
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 rounded-b-lg">
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Market Manager License System v1.0.0
            </p>
            <button
              onClick={onClose}
              className="btn-secondary text-sm"
            >
              إغلاق
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LicenseDetailsModal;
