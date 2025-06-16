import React, { useState, useEffect } from 'react';
import {
  X,
  Save,
  User,
  Mail,
  Shield,
  CheckCircle,
  XCircle,
  Loader,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react';
import toast from 'react-hot-toast';

const EditUserModal = ({ isOpen, onClose, user, onUserUpdated }) => {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    fullName: '',
    role: 'user',
    isActive: true,
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        email: user.email || '',
        fullName: user.fullName || '',
        role: user.role || 'user',
        isActive: user.isActive !== false,
        newPassword: '',
        confirmPassword: ''
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const validateForm = () => {
    if (!formData.username.trim()) {
      toast.error('يرجى إدخال اسم المستخدم');
      return false;
    }

    if (!formData.email.trim()) {
      toast.error('يرجى إدخال البريد الإلكتروني');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('البريد الإلكتروني غير صحيح');
      return false;
    }

    if (!formData.fullName.trim()) {
      toast.error('يرجى إدخال الاسم الكامل');
      return false;
    }

    // التحقق من كلمة المرور الجديدة إذا تم إدخالها
    if (formData.newPassword) {
      if (formData.newPassword.length < 6) {
        toast.error('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
        return false;
      }

      if (formData.newPassword !== formData.confirmPassword) {
        toast.error('كلمات المرور غير متطابقة');
        return false;
      }
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const { ipcRenderer } = window.require ? window.require('electron') : { ipcRenderer: null };
      
      if (ipcRenderer) {
        const updateData = {
          userId: user.id,
          username: formData.username.trim(),
          email: formData.email.trim(),
          fullName: formData.fullName.trim(),
          role: formData.role,
          isActive: formData.isActive
        };

        // إضافة كلمة المرور الجديدة إذا تم إدخالها
        if (formData.newPassword) {
          updateData.newPassword = formData.newPassword;
        }

        const result = await ipcRenderer.invoke('admin-update-user', updateData);
        
        if (result.success) {
          toast.success('تم تحديث المستخدم بنجاح');
          onUserUpdated(result.user);
          onClose();
        } else {
          toast.error(result.error || 'فشل في تحديث المستخدم');
        }
      }
    } catch (error) {
      console.error('خطأ في تحديث المستخدم:', error);
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

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            تعديل المستخدم
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
          {/* User Info Display */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              معلومات الحساب
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600 dark:text-gray-400">معرف المستخدم:</span>
                <div className="font-medium text-gray-900 dark:text-white">
                  {user.id}
                </div>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">تاريخ الإنشاء:</span>
                <div className="font-medium text-gray-900 dark:text-white">
                  {formatDate(user.createdAt)}
                </div>
              </div>
              {user.lastLogin && (
                <div>
                  <span className="text-gray-600 dark:text-gray-400">آخر دخول:</span>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {formatDate(user.lastLogin)}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                اسم المستخدم
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
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
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              الاسم الكامل
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              disabled={loading}
            />
          </div>

          {/* Role and Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                الدور
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                disabled={loading}
              >
                <option value="user">مستخدم</option>
                <option value="admin">مدير</option>
              </select>
            </div>

            <div className="flex items-center justify-center">
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
                  الحساب نشط
                </span>
                {formData.isActive ? (
                  <CheckCircle size={16} className="text-green-500" />
                ) : (
                  <XCircle size={16} className="text-red-500" />
                )}
              </label>
            </div>
          </div>

          {/* Password Change Section */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
              تغيير كلمة المرور (اختياري)
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  كلمة المرور الجديدة
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="اتركه فارغاً للاحتفاظ بكلمة المرور الحالية"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    disabled={loading}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  تأكيد كلمة المرور
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="أعد إدخال كلمة المرور الجديدة"
                  disabled={loading}
                />
              </div>
            </div>

            {formData.newPassword && (
              <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                <Lock size={14} className="inline mr-1" />
                سيتم تحديث كلمة المرور عند الحفظ
              </div>
            )}
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

export default EditUserModal;
