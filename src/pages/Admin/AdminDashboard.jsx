import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Users,
  Shield,
  Key,
  BarChart3,
  UserCheck,
  UserX,
  Calendar,
  Activity,
  TrendingUp,
  Database,
  Settings,
  Plus,
  RefreshCw
} from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

import useAuthStore from '../../store/useAuthStore';

const StatCard = ({ title, value, icon: Icon, color, change, changeType, onClick }) => {
  const isPositive = changeType === 'positive';
  
  return (
    <div 
      className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:shadow-xl hover:-translate-y-1' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
            {title}
          </p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {value}
          </p>
          {change && (
            <p className={`text-sm mt-1 ${
              isPositive ? 'text-green-600' : 'text-red-600'
            }`}>
              {isPositive ? '+' : ''}{change}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon size={28} className="text-white" />
        </div>
      </div>
    </div>
  );
};

const QuickActionCard = ({ title, description, icon: Icon, color, to, onClick }) => {
  const content = (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 transition-all duration-200 hover:shadow-xl hover:-translate-y-1 cursor-pointer">
      <div className="flex items-center space-x-4 rtl:space-x-reverse">
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon size={24} className="text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {description}
          </p>
        </div>
      </div>
    </div>
  );

  if (to) {
    return <Link to={to}>{content}</Link>;
  }

  return <div onClick={onClick}>{content}</div>;
};

const AdminDashboard = () => {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalLicenses: 0,
    activeLicenses: 0,
    expiringSoon: 0,
    systemHealth: 100
  });

  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // جلب إحصائيات النظام
    fetchSystemStats();
  }, []);

  const fetchSystemStats = async () => {
    setLoading(true);
    try {
      const { ipcRenderer } = window.require ? window.require('electron') : { ipcRenderer: null };

      if (ipcRenderer) {
        const result = await ipcRenderer.invoke('admin-get-statistics');
        if (result.success) {
          const statistics = result.statistics;

          setStats({
            totalUsers: statistics.users.total,
            activeUsers: statistics.users.active,
            totalLicenses: statistics.licenses.total,
            activeLicenses: statistics.licenses.active,
            expiringSoon: statistics.licenses.expiringSoon,
            systemHealth: 100
          });

          // تحديث النشاطات الأخيرة
          const activities = [];

          // إضافة المستخدمين الجدد
          statistics.users.recent.forEach(user => {
            activities.push({
              description: `تم إنشاء حساب جديد: ${user.fullName}`,
              timestamp: new Date(user.createdAt).toLocaleDateString('ar-SA'),
              type: 'user_created'
            });
          });

          // إضافة التراخيص الجديدة
          statistics.licenses.recent.forEach(license => {
            activities.push({
              description: `تم إنشاء ترخيص جديد لـ: ${license.customerName}`,
              timestamp: new Date(license.createdAt).toLocaleDateString('ar-SA'),
              type: 'license_created'
            });
          });

          // ترتيب النشاطات حسب التاريخ
          activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
          setRecentActivity(activities.slice(0, 5));
        } else {
          toast.error('فشل في جلب الإحصائيات');
        }
      } else {
        // وضع الويب - بيانات تجريبية
        setStats({
          totalUsers: 5,
          activeUsers: 3,
          totalLicenses: 12,
          activeLicenses: 10,
          expiringSoon: 2,
          systemHealth: 95
        });

        setRecentActivity([
          {
            description: 'تم إنشاء حساب جديد: أحمد محمد',
            timestamp: new Date().toLocaleDateString('ar-SA'),
            type: 'user_created'
          },
          {
            description: 'تم إنشاء ترخيص جديد لـ: شركة التقنية',
            timestamp: new Date().toLocaleDateString('ar-SA'),
            type: 'license_created'
          }
        ]);
      }
    } catch (error) {
      console.error('خطأ في جلب الإحصائيات:', error);
      toast.error('خطأ في جلب الإحصائيات');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              مرحباً، {user?.fullName || 'المدير'}
            </h1>
            <p className="text-purple-100">
              لوحة تحكم المدير - إدارة شاملة للنظام
            </p>
          </div>
          <div className="flex items-center space-x-4 rtl:space-x-reverse">
            <button
              onClick={fetchSystemStats}
              disabled={loading}
              className="flex items-center space-x-2 rtl:space-x-reverse bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors duration-200 disabled:opacity-50"
              title="تحديث الإحصائيات"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              <span className="hidden sm:inline">تحديث</span>
            </button>
            <div className="hidden md:block">
              <div className="p-4 bg-white/10 rounded-xl">
                <Shield size={48} className="text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <StatCard
          title="إجمالي المستخدمين"
          value={stats.totalUsers}
          icon={Users}
          color="bg-blue-500"
          change="3 جديد هذا الأسبوع"
          changeType="positive"
          onClick={() => window.location.href = '/admin/users'}
        />
        
        <StatCard
          title="المستخدمين النشطين"
          value={stats.activeUsers}
          icon={UserCheck}
          color="bg-green-500"
          change={stats.totalUsers > 0 ? `${((stats.activeUsers / stats.totalUsers) * 100).toFixed(1)}% من الإجمالي` : 'لا توجد بيانات'}
          changeType="positive"
        />
        
        <StatCard
          title="إجمالي التراخيص"
          value={stats.totalLicenses}
          icon={Key}
          color="bg-purple-500"
          change={`${stats.activeLicenses} نشط`}
          changeType="positive"
          onClick={() => window.location.href = '/admin/licenses'}
        />

        <StatCard
          title="تراخيص تنتهي قريباً"
          value={stats.expiringSoon}
          icon={Calendar}
          color={stats.expiringSoon > 0 ? "bg-orange-500" : "bg-green-500"}
          change={stats.expiringSoon > 0 ? "يحتاج متابعة" : "لا توجد تراخيص منتهية"}
          changeType={stats.expiringSoon > 0 ? "negative" : "positive"}
        />
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          إجراءات سريعة
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <QuickActionCard
            title="إدارة المستخدمين"
            description="عرض وإدارة حسابات المستخدمين"
            icon={Users}
            color="bg-blue-500"
            to="/admin/users"
          />
          
          <QuickActionCard
            title="إدارة التراخيص"
            description="إنشاء وإدارة تراخيص النظام"
            icon={Key}
            color="bg-purple-500"
            to="/admin/licenses"
          />
          
          <QuickActionCard
            title="إنشاء ترخيص جديد"
            description="إنشاء ترخيص جديد للعملاء"
            icon={Plus}
            color="bg-green-500"
            to="/admin/licenses/create"
          />
          
         
        </div>
      </div>

      {/* Recent Activity & System Health */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              النشاطات الأخيرة
            </h3>
            <Link 
              to="/admin/activity"
              className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400"
            >
              عرض الكل
            </Link>
          </div>
          
          <div className="space-y-3">
            {recentActivity.length > 0 ? (
              recentActivity.slice(0, 5).map((activity, index) => (
                <div key={index} className="flex items-center space-x-3 rtl:space-x-reverse p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900 dark:text-white">
                      {activity.description}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {activity.timestamp}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Activity size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  لا توجد نشاطات حديثة
                </p>
              </div>
            )}
          </div>
        </div>

        {/* System Health */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            صحة النظام
          </h3>
          
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  الأداء العام
                </span>
                <span className="text-sm font-medium text-green-600">
                  {stats.systemHealth}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${stats.systemHealth}%` }}
                ></div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <Database size={24} className="mx-auto text-green-500 mb-1" />
                <p className="text-xs text-green-700 dark:text-green-400">
                  قاعدة البيانات
                </p>
                <p className="text-sm font-medium text-green-800 dark:text-green-300">
                  متصلة
                </p>
              </div>
              
              <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <TrendingUp size={24} className="mx-auto text-blue-500 mb-1" />
                <p className="text-xs text-blue-700 dark:text-blue-400">
                  الخدمات
                </p>
                <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
                  تعمل بشكل طبيعي
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
