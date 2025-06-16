import React, { useState } from 'react';
import {
  Key,
  User,
  Mail,
  Calendar,
  Clock,
  Save,
  ArrowLeft,
  RefreshCw,
  Copy,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate, Link } from 'react-router-dom';

const CreateLicense = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    durationDays: 30
  });
  const [generatedLicense, setGeneratedLicense] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.customerName.trim()) {
      toast.error('يرجى إدخال اسم العميل');
      return false;
    }

    if (!formData.customerEmail.trim()) {
      toast.error('يرجى إدخال البريد الإلكتروني');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.customerEmail)) {
      toast.error('البريد الإلكتروني غير صحيح');
      return false;
    }

    if (!formData.durationDays || formData.durationDays < 1) {
      toast.error('يرجى إدخال مدة صحيحة للترخيص');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      const { ipcRenderer } = window.require ? window.require('electron') : { ipcRenderer: null };
      
      if (ipcRenderer) {
        const result = await ipcRenderer.invoke('admin-create-license', {
          customerName: formData.customerName.trim(),
          customerEmail: formData.customerEmail.trim(),
          durationDays: parseInt(formData.durationDays)
        });
        
        if (result.success) {
          setGeneratedLicense(result.license);
          toast.success('تم إنشاء الترخيص بنجاح');
        } else {
          toast.error(result.error || 'فشل في إنشاء الترخيص');
        }
      }
    } catch (error) {
      console.error('خطأ في إنشاء الترخيص:', error);
      toast.error('خطأ في الاتصال');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('تم نسخ مفتاح الترخيص');
    } catch (error) {
      toast.error('فشل في نسخ النص');
    }
  };

  const resetForm = () => {
    setFormData({
      customerName: '',
      customerEmail: '',
      durationDays: 30
    });
    setGeneratedLicense(null);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const durationOptions = [
    { value: 7, label: '7 أيام (تجريبي)' },
    { value: 30, label: '30 يوم (شهر)' },
    { value: 90, label: '90 يوم (3 أشهر)' },
    { value: 180, label: '180 يوم (6 أشهر)' },
    { value: 365, label: '365 يوم (سنة)' },
    { value: 730, label: '730 يوم (سنتين)' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <Link
            to="/admin/licenses"
            className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              إنشاء ترخيص جديد
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              إنشاء ترخيص جديد للعملاء مع تحديد المدة
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            معلومات الترخيص
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Customer Name */}
            <div>
              <label className="flex items-center space-x-2 rtl:space-x-reverse text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <User size={16} className="text-blue-500" />
                <span>اسم العميل</span>
              </label>
              <input
                type="text"
                name="customerName"
                value={formData.customerName}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="أدخل اسم العميل"
                disabled={loading}
                required
              />
            </div>

            {/* Customer Email */}
            <div>
              <label className="flex items-center space-x-2 rtl:space-x-reverse text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Mail size={16} className="text-blue-500" />
                <span>البريد الإلكتروني</span>
              </label>
              <input
                type="email"
                name="customerEmail"
                value={formData.customerEmail}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="أدخل البريد الإلكتروني"
                disabled={loading}
                required
              />
            </div>

            {/* Duration */}
            <div>
              <label className="flex items-center space-x-2 rtl:space-x-reverse text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Clock size={16} className="text-blue-500" />
                <span>مدة الترخيص</span>
              </label>
              <select
                name="durationDays"
                value={formData.durationDays}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                disabled={loading}
                required
              >
                {durationOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                تاريخ الانتهاء: {new Date(Date.now() + formData.durationDays * 24 * 60 * 60 * 1000).toLocaleDateString('ar-SA')}
              </p>
            </div>

            {/* Custom Duration */}
            <div>
              <label className="flex items-center space-x-2 rtl:space-x-reverse text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Calendar size={16} className="text-blue-500" />
                <span>مدة مخصصة (بالأيام)</span>
              </label>
              <input
                type="number"
                name="durationDays"
                value={formData.durationDays}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="أدخل عدد الأيام"
                min="1"
                max="3650"
                disabled={loading}
                required
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 rtl:space-x-reverse shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  <span>جاري الإنشاء...</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>إنشاء الترخيص</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Generated License */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            الترخيص المُنشأ
          </h2>

          {generatedLicense ? (
            <div className="space-y-6">
              {/* Success Message */}
              <div className="flex items-center space-x-2 rtl:space-x-reverse p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <CheckCircle size={20} className="text-green-500" />
                <span className="text-green-700 dark:text-green-400 font-medium">
                  تم إنشاء الترخيص بنجاح!
                </span>
              </div>

              {/* License Details */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    اسم العميل
                  </label>
                  <p className="text-gray-900 dark:text-white">
                    {generatedLicense.customerName}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    البريد الإلكتروني
                  </label>
                  <p className="text-gray-900 dark:text-white">
                    {generatedLicense.customerEmail}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    مفتاح الترخيص
                  </label>
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <div className="flex-1 bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                      <code className="text-sm font-mono text-gray-900 dark:text-white break-all">
                        {generatedLicense.licenseKey}
                      </code>
                    </div>
                    <button
                      onClick={() => copyToClipboard(generatedLicense.licenseKey)}
                      className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                      title="نسخ المفتاح"
                    >
                      <Copy size={16} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      المدة
                    </label>
                    <p className="text-gray-900 dark:text-white">
                      {generatedLicense.durationDays} يوم
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      تاريخ الانتهاء
                    </label>
                    <p className="text-gray-900 dark:text-white">
                      {formatDate(generatedLicense.expiresAt)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-3 rtl:space-x-reverse">
                <button
                  onClick={resetForm}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                >
                  إنشاء ترخيص آخر
                </button>
                <Link
                  to="/admin/licenses"
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 text-center"
                >
                  العودة للقائمة
                </Link>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <Key size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                لم يتم إنشاء ترخيص بعد
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                املأ النموذج واضغط "إنشاء الترخيص" لإنشاء ترخيص جديد
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateLicense;
