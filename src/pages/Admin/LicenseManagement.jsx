import React, { useState, useEffect } from 'react';
import {
  Key,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  Calendar,
  User,
  CheckCircle,
  XCircle,
  Clock,
  Copy,
  Eye,
  EyeOff,
  AlertTriangle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import EditLicenseModal from '../../components/Admin/EditLicenseModal';

const LicenseManagement = () => {
  const [licenses, setLicenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showKeys, setShowKeys] = useState({});
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedLicense, setSelectedLicense] = useState(null);

  useEffect(() => {
    fetchLicenses();
  }, []);

  const fetchLicenses = async () => {
    setLoading(true);
    try {
      const { ipcRenderer } = window.require ? window.require('electron') : { ipcRenderer: null };
      
      if (ipcRenderer) {
        const result = await ipcRenderer.invoke('admin-get-licenses');
        if (result.success) {
          setLicenses(result.licenses);
        } else {
          toast.error('فشل في جلب التراخيص');
        }
      }
    } catch (error) {
      console.error('خطأ في جلب التراخيص:', error);
      toast.error('خطأ في الاتصال');
    } finally {
      setLoading(false);
    }
  };

  const deleteLicense = async (licenseId) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا الترخيص؟')) {
      return;
    }

    try {
      const { ipcRenderer } = window.require ? window.require('electron') : { ipcRenderer: null };
      
      if (ipcRenderer) {
        const result = await ipcRenderer.invoke('admin-delete-license', licenseId);
        
        if (result.success) {
          toast.success('تم حذف الترخيص بنجاح');
          fetchLicenses();
        } else {
          toast.error(result.error || 'فشل في حذف الترخيص');
        }
      }
    } catch (error) {
      console.error('خطأ في حذف الترخيص:', error);
      toast.error('خطأ في الاتصال');
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

  const toggleKeyVisibility = (licenseId) => {
    setShowKeys(prev => ({
      ...prev,
      [licenseId]: !prev[licenseId]
    }));
  };

  const handleEditLicense = (license) => {
    setSelectedLicense(license);
    setShowEditModal(true);
  };

  const handleLicenseUpdated = (updatedLicense) => {
    setLicenses(prev => prev.map(license =>
      license.id === updatedLicense.id ? updatedLicense : license
    ));
    setShowEditModal(false);
    setSelectedLicense(null);
  };

  const getLicenseStatus = (license) => {
    const now = new Date();
    const expiryDate = new Date(license.expiresAt);
    const daysRemaining = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));

    if (daysRemaining < 0) {
      return { status: 'expired', text: 'منتهي', color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' };
    } else if (daysRemaining <= 7) {
      return { status: 'expiring', text: 'ينتهي قريباً', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' };
    } else {
      return { status: 'active', text: 'نشط', color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' };
    }
  };

  const filteredLicenses = licenses.filter(license => {
    const matchesSearch = license.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         license.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         license.licenseKey.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterStatus === 'all') return matchesSearch;
    
    const status = getLicenseStatus(license).status;
    return matchesSearch && status === filterStatus;
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatLicenseKey = (key, isVisible) => {
    if (isVisible) return key;
    return key.substring(0, 8) + '••••••••••••••••';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">جاري تحميل التراخيص...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            إدارة التراخيص
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            إدارة تراخيص النظام ومراقبة انتهاء الصلاحية
          </p>
        </div>
        
        <Link
          to="/admin/licenses/create"
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2 rtl:space-x-reverse"
        >
          <Plus size={16} />
          <span>إنشاء ترخيص</span>
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <Search size={16} className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="البحث في التراخيص..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 rtl:pl-3 rtl:pr-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          >
            <option value="all">جميع الحالات</option>
            <option value="active">نشط</option>
            <option value="expiring">ينتهي قريباً</option>
            <option value="expired">منتهي</option>
          </select>
        </div>
      </div>

      {/* Licenses Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredLicenses.map((license) => {
          const status = getLicenseStatus(license);
          const isKeyVisible = showKeys[license.id];
          const now = new Date();
          const expiryDate = new Date(license.expiresAt);
          const daysRemaining = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));

          return (
            <div key={license.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <Key size={20} className="text-blue-500" />
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                    {status.text}
                  </span>
                </div>
                
                <div className="flex items-center space-x-1 rtl:space-x-reverse">
                  <button
                    onClick={() => copyToClipboard(license.licenseKey)}
                    className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    title="نسخ المفتاح"
                  >
                    <Copy size={14} />
                  </button>
                  <button
                    onClick={() => toggleKeyVisibility(license.id)}
                    className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    title={isKeyVisible ? 'إخفاء المفتاح' : 'إظهار المفتاح'}
                  >
                    {isKeyVisible ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                  <button
                    onClick={() => handleEditLicense(license)}
                    className="p-1 text-blue-400 hover:text-blue-600 transition-colors"
                    title="تعديل الترخيص"
                  >
                    <Edit size={14} />
                  </button>
                  <button
                    onClick={() => deleteLicense(license.id)}
                    className="p-1 text-red-400 hover:text-red-600 transition-colors"
                    title="حذف الترخيص"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Customer Info */}
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                  {license.customerName}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {license.customerEmail}
                </p>
              </div>

              {/* License Key */}
              <div className="mb-4">
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                  مفتاح الترخيص
                </label>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                  <code className="text-xs font-mono text-gray-900 dark:text-white break-all">
                    {formatLicenseKey(license.licenseKey, isKeyVisible)}
                  </code>
                </div>
              </div>

              {/* Duration & Expiry */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                    المدة
                  </label>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {license.durationDays} يوم
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                    ينتهي في
                  </label>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatDate(license.expiresAt)}
                  </p>
                </div>
              </div>

              {/* Days Remaining */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">الأيام المتبقية</span>
                  <span className={`font-medium ${
                    daysRemaining < 0 ? 'text-red-600' :
                    daysRemaining <= 7 ? 'text-yellow-600' :
                    'text-green-600'
                  }`}>
                    {daysRemaining < 0 ? 'منتهي' : `${daysRemaining} يوم`}
                  </span>
                </div>
                <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      daysRemaining < 0 ? 'bg-red-500' :
                      daysRemaining <= 7 ? 'bg-yellow-500' :
                      'bg-green-500'
                    }`}
                    style={{
                      width: `${Math.max(0, Math.min(100, (daysRemaining / license.durationDays) * 100))}%`
                    }}
                  ></div>
                </div>
              </div>

              {/* Dates */}
              <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                <div className="flex justify-between">
                  <span>تاريخ الإنشاء:</span>
                  <span>{formatDate(license.createdAt)}</span>
                </div>
                {license.activatedAt && (
                  <div className="flex justify-between">
                    <span>تاريخ التفعيل:</span>
                    <span>{formatDate(license.activatedAt)}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredLicenses.length === 0 && (
        <div className="text-center py-12">
          <Key size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            لا توجد تراخيص
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            {searchTerm || filterStatus !== 'all'
              ? 'لا توجد نتائج تطابق البحث'
              : 'لم يتم إنشاء أي تراخيص بعد'
            }
          </p>
          <Link
            to="/admin/licenses/create"
            className="inline-flex items-center space-x-2 rtl:space-x-reverse bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
          >
            <Plus size={16} />
            <span>إنشاء ترخيص جديد</span>
          </Link>
        </div>
      )}

      {/* Edit License Modal */}
      <EditLicenseModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedLicense(null);
        }}
        license={selectedLicense}
        onLicenseUpdated={handleLicenseUpdated}
      />
    </div>
  );
};

export default LicenseManagement;
