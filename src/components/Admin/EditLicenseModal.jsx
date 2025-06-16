import React, { useState, useEffect } from 'react';
import {
  X,
  Save,
  Calendar,
  User,
  Mail,
  Key,
  Clock,
  CheckCircle,
  XCircle,
  Loader,
  Plus,
  Minus
} from 'lucide-react';
import toast from 'react-hot-toast';

const EditLicenseModal = ({ isOpen, onClose, license, onLicenseUpdated }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    durationDays: 30,
    isActive: true,
    additionalDays: 0
  });

  useEffect(() => {
    if (license) {
      setFormData({
        customerName: license.customerName || '',
        customerEmail: license.customerEmail || '',
        durationDays: license.durationDays || 30,
        isActive: license.isActive !== false,
        additionalDays: 0
      });
    }
  }, [license]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = async () => {
    if (!formData.customerName.trim()) {
      toast.error('يرجى إدخال اسم العميل');
      return;
    }

    if (!formData.customerEmail.trim()) {
      toast.error('يرجى إدخال البريد الإلكتروني');
      return;
    }

    setLoading(true);

    try {
      const { ipcRenderer } = window.require ? window.require('electron') : { ipcRenderer: null };
      
      if (ipcRenderer) {
        const result = await ipcRenderer.invoke('admin-update-license', {
          licenseId: license.id,
          customerName: formData.customerName.trim(),
          customerEmail: formData.customerEmail.trim(),
          durationDays: parseInt(formData.durationDays),
          isActive: formData.isActive,
          additionalDays: parseInt(formData.additionalDays)
        });
        
        if (result.success) {
          toast.success('تم تحديث الترخيص بنجاح');
          onLicenseUpdated(result.license);
          onClose();
        } else {
          toast.error(result.error || 'فشل في تحديث الترخيص');
        }
      }
    } catch (error) {
      console.error('خطأ في تحديث الترخيص:', error);
      toast.error('خطأ في الاتصال');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateNewExpiryDate = () => {
    if (!license) return '';
    
    const currentExpiry = new Date(license.expiresAt);
    const additionalMs = formData.additionalDays * 24 * 60 * 60 * 1000;
    const newExpiry = new Date(currentExpiry.getTime() + additionalMs);
    
    return newExpiry.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!isOpen || !license) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            تعديل الترخيص
          </h3>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* License Key Display */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              مفتاح الترخيص
            </label>
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <Key size={16} className="text-blue-500" />
              <code className="text-sm font-mono text-gray-900 dark:text-white">
                {license.licenseKey}
              </code>
            </div>
          </div>

          {/* Customer Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                اسم العميل
              </label>
              <input
                type="text"
                name="customerName"
                value={formData.customerName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                البريد الإلكتروني
              </label>
              <input
                type="email"
                name="customerEmail"
                value={formData.customerEmail}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                disabled={loading}
              />
            </div>
          </div>

          {/* License Status */}
          <div>
            <label className="flex items-center space-x-2 rtl:space-x-reverse">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleInputChange}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                disabled={loading}
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                الترخيص نشط
              </span>
              {formData.isActive ? (
                <CheckCircle size={16} className="text-green-500" />
              ) : (
                <XCircle size={16} className="text-red-500" />
              )}
            </label>
          </div>

          {/* Current Expiry Info */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-2">
              معلومات الانتهاء الحالية
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600 dark:text-gray-400">تاريخ الانتهاء الحالي:</span>
                <div className="font-medium text-gray-900 dark:text-white">
                  {formatDate(license.expiresAt)}
                </div>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">المدة الأصلية:</span>
                <div className="font-medium text-gray-900 dark:text-white">
                  {license.durationDays} يوم
                </div>
              </div>
            </div>
          </div>

          {/* Add/Remove Days */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              إضافة أو إزالة أيام
            </label>
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, additionalDays: prev.additionalDays - 1 }))}
                className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                disabled={loading}
              >
                <Minus size={16} />
              </button>
              
              <input
                type="number"
                name="additionalDays"
                value={formData.additionalDays}
                onChange={handleInputChange}
                className="w-24 px-3 py-2 text-center border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                disabled={loading}
              />
              
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, additionalDays: prev.additionalDays + 1 }))}
                className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                disabled={loading}
              >
                <Plus size={16} />
              </button>
              
              <span className="text-sm text-gray-600 dark:text-gray-400">
                أيام ({formData.additionalDays > 0 ? '+' : ''}{formData.additionalDays})
              </span>
            </div>
            
            {formData.additionalDays !== 0 && (
              <div className="mt-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <div className="text-sm text-yellow-800 dark:text-yellow-300">
                  <strong>تاريخ الانتهاء الجديد:</strong> {calculateNewExpiryDate()}
                </div>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              إجراءات سريعة
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, additionalDays: 7 }))}
                className="px-3 py-2 text-sm bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:hover:bg-blue-900/40 rounded-lg transition-colors"
                disabled={loading}
              >
                +7 أيام
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, additionalDays: 30 }))}
                className="px-3 py-2 text-sm bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/20 dark:text-green-300 dark:hover:bg-green-900/40 rounded-lg transition-colors"
                disabled={loading}
              >
                +30 يوم
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, additionalDays: 90 }))}
                className="px-3 py-2 text-sm bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:hover:bg-purple-900/40 rounded-lg transition-colors"
                disabled={loading}
              >
                +90 يوم
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, additionalDays: 365 }))}
                className="px-3 py-2 text-sm bg-orange-100 text-orange-700 hover:bg-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:hover:bg-orange-900/40 rounded-lg transition-colors"
                disabled={loading}
              >
                +سنة
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 rtl:space-x-reverse p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            disabled={loading}
          >
            إلغاء
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2 rtl:space-x-reverse disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader size={16} className="animate-spin" />
                <span>جاري الحفظ...</span>
              </>
            ) : (
              <>
                <Save size={16} />
                <span>حفظ التغييرات</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditLicenseModal;
