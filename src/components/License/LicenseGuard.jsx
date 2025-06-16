import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Shield, AlertTriangle, X } from 'lucide-react';
import LicenseModal from './LicenseModal';
import LicenseDetailsModal from './LicenseDetailsModal';
import { useLicense } from './LicenseProvider';
import useAuthStore from '../../store/useAuthStore';
import toast from 'react-hot-toast';

const { ipcRenderer } = window.require ? window.require('electron') : { ipcRenderer: null };

const LicenseGuard = ({ children }) => {
  const { t } = useTranslation();
  const { showLicenseBar, handleCloseLicenseBar } = useLicense();
  const { isAdmin } = useAuthStore();
  const [isLicenseValid, setIsLicenseValid] = useState(false);
  const [showLicenseModal, setShowLicenseModal] = useState(true);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [licenseInfo, setLicenseInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkLicenseStatus();
    
    // فحص دوري للترخيص كل 5 دقائق
    const interval = setInterval(checkLicenseStatus, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (licenseInfo) {
      // فحص انتهاء الصلاحية قريباً
      checkExpiryWarning();
    }
  }, [licenseInfo]);

  const checkLicenseStatus = async () => {
    setLoading(true);

    try {
      // السماح للأدمن بالدخول بدون ترخيص
      if (isAdmin()) {
        setIsLicenseValid(true);
        setShowLicenseModal(false);
        setLicenseInfo(null); // لا نعرض أي معلومات ترخيص للأدمن
        setLoading(false);
        return;
      }

      if (ipcRenderer) {
        const result = await ipcRenderer.invoke('check-saved-license');

        if (result.isValid) {
          setIsLicenseValid(true);
          setShowLicenseModal(false);
          setLicenseInfo(result.license);
        } else {
          setIsLicenseValid(false);
          setShowLicenseModal(true);
          setLicenseInfo(null);

          // إظهار رسالة خطأ إذا كان الترخيص منتهي
          if (result.errorCode === 'LICENSE_EXPIRED') {
            toast.error(`انتهت صلاحية الترخيص في ${result.expiryDate}`);
          }
        }
      } else {
        // وضع التطوير - السماح بالدخول
        setIsLicenseValid(true);
        setShowLicenseModal(false);
      }
    } catch (error) {
      console.error('Error checking license status:', error);
      // السماح للأدمن بالدخول حتى في حالة الخطأ
      if (isAdmin()) {
        setIsLicenseValid(true);
        setShowLicenseModal(false);
      } else {
        setIsLicenseValid(false);
        setShowLicenseModal(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const checkExpiryWarning = async () => {
    if (!ipcRenderer || !licenseInfo) return;

    try {
      const isExpiringSoon = await ipcRenderer.invoke('check-license-expiry', 7);
      
      if (isExpiringSoon && licenseInfo.daysRemaining <= 7) {
        toast((t) => (
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <AlertTriangle className="text-yellow-500" size={20} />
            <div>
              <div className="font-medium">تحذير انتهاء الترخيص</div>
              <div className="text-sm text-gray-600">
                سينتهي الترخيص خلال {licenseInfo.daysRemaining} أيام
              </div>
            </div>
          </div>
        ), {
          duration: 8000,
          style: {
            background: '#fef3c7',
            border: '1px solid #f59e0b',
          },
        });
      }
    } catch (error) {
      console.error('Error checking expiry warning:', error);
    }
  };

  const handleLicenseValid = (license) => {
    setIsLicenseValid(true);
    setShowLicenseModal(false);
    setLicenseInfo(license);
    toast.success('مرحباً بك في Market Manager!');
  };

  const handleShowLicenseInfo = () => {
    setShowDetailsModal(true);
  };

  const handleLicenseUpdated = (updatedLicense) => {
    setLicenseInfo(updatedLicense);
    toast.success('تم تحديث الترخيص بنجاح!');
  };

  const handleCloseLicenseBarWithToast = () => {
    handleCloseLicenseBar();
    toast.success('تم إخفاء شريط الترخيص');
  };

  // شاشة التحميل
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">جاري فحص الترخيص...</p>
        </div>
      </div>
    );
  }

  // إذا لم يكن الترخيص صالح، إظهار نافذة الترخيص فقط
  if (!isLicenseValid) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <LicenseModal
          isOpen={showLicenseModal}
          onLicenseValid={handleLicenseValid}
          onClose={null} // منع إغلاق النافذة
        />
        
        {/* خلفية التطبيق */}
        <div className="absolute inset-0 flex items-center justify-center opacity-10">
          <div className="text-center">
            <Shield size={120} className="mx-auto text-gray-400 mb-4" />
            <h1 className="text-4xl font-bold text-gray-400 mb-2">Market Manager</h1>
            <p className="text-gray-400">نظام إدارة السوبر ماركت</p>
          </div>
        </div>
      </div>
    );
  }

  // إذا كان الترخيص صالح، إظهار التطبيق مع شريط معلومات الترخيص
  return (
    <div className="min-h-screen">
      {/* شريط معلومات الترخيص - للأدمن فقط */}
      {licenseInfo && showLicenseBar && isAdmin() && (
        <div className={`text-white px-4 py-2 text-sm flex items-center justify-between transition-colors ${
          licenseInfo.isAdmin
            ? 'bg-purple-600'
            : licenseInfo.daysRemaining <= 7
            ? 'bg-yellow-600'
            : 'bg-green-600'
        }`}>
          {/* الجزء الأيسر - معلومات الترخيص */}
          <div
            className="flex items-center space-x-2 rtl:space-x-reverse cursor-pointer hover:opacity-80 flex-1"
            onClick={licenseInfo.isAdmin ? undefined : handleShowLicenseInfo}
            title={licenseInfo.isAdmin ? "حساب المدير - بدون قيود ترخيص" : "اضغط لعرض تفاصيل الترخيص"}
          >
            <Shield size={16} />
            <span>
              {licenseInfo.isAdmin ? (
                '👑 حساب المدير - وصول كامل بدون قيود'
              ) : (
                `الترخيص مفعل - ينتهي في ${new Date(licenseInfo.expiresAt).toLocaleDateString('ar-SA')} (${licenseInfo.daysRemaining} أيام متبقية)`
              )}
            </span>
            {!licenseInfo.isAdmin && licenseInfo.daysRemaining <= 7 && (
              <AlertTriangle size={16} className="animate-pulse" />
            )}
          </div>

          {/* الجزء الأوسط - نص التفاصيل */}
          {!licenseInfo.isAdmin && (
            <div
              className="flex items-center space-x-2 rtl:space-x-reverse cursor-pointer hover:opacity-80"
              onClick={handleShowLicenseInfo}
            >
              <span className="text-xs opacity-75">اضغط للتفاصيل</span>
              <div className="w-2 h-2 bg-white rounded-full opacity-60"></div>
            </div>
          )}

          {/* الجزء الأيمن - زر الإغلاق */}
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleCloseLicenseBarWithToast();
              }}
              className="p-1 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
              title="إخفاء شريط الترخيص"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* محتوى التطبيق */}
      {children}

      {/* نافذة معلومات الترخيص */}
      <LicenseModal
        isOpen={showLicenseModal}
        onLicenseValid={handleLicenseValid}
        onClose={() => setShowLicenseModal(false)}
      />

      {/* نافذة تفاصيل الترخيص */}
      <LicenseDetailsModal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        currentLicense={licenseInfo}
        onLicenseUpdated={handleLicenseUpdated}
      />
    </div>
  );
};

export default LicenseGuard;
