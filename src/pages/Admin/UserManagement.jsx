import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Edit,
  Trash2,
  UserCheck,
  UserX,
  Search,
  Filter,
  MoreVertical,
  Shield,
  User,
  Mail,
  Calendar,
  Eye,
  EyeOff,
  X,
  Lock,
  Save,
  Loader
} from 'lucide-react';
import toast from 'react-hot-toast';
import EditUserModal from '../../components/Admin/EditUserModal';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    fullName: '',
    password: '',
    confirmPassword: '',
    role: 'user'
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { ipcRenderer } = window.require ? window.require('electron') : { ipcRenderer: null };
      
      if (ipcRenderer) {
        const result = await ipcRenderer.invoke('admin-get-users');
        if (result.success) {
          setUsers(result.users);
        } else {
          toast.error('فشل في جلب المستخدمين');
        }
      }
    } catch (error) {
      console.error('خطأ في جلب المستخدمين:', error);
      toast.error('خطأ في الاتصال');
    } finally {
      setLoading(false);
    }
  };

  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      const { ipcRenderer } = window.require ? window.require('electron') : { ipcRenderer: null };
      
      if (ipcRenderer) {
        const result = await ipcRenderer.invoke('admin-toggle-user-status', {
          userId,
          isActive: !currentStatus
        });
        
        if (result.success) {
          toast.success(currentStatus ? 'تم إيقاف المستخدم' : 'تم تفعيل المستخدم');
          fetchUsers();
        } else {
          toast.error(result.error || 'فشل في تحديث حالة المستخدم');
        }
      }
    } catch (error) {
      console.error('خطأ في تحديث حالة المستخدم:', error);
      toast.error('خطأ في الاتصال');
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا المستخدم؟')) {
      return;
    }

    try {
      const { ipcRenderer } = window.require ? window.require('electron') : { ipcRenderer: null };

      if (ipcRenderer) {
        const result = await ipcRenderer.invoke('admin-delete-user', userId);

        if (result.success) {
          toast.success('تم حذف المستخدم بنجاح');
          fetchUsers();
        } else {
          toast.error(result.error || 'فشل في حذف المستخدم');
        }
      }
    } catch (error) {
      console.error('خطأ في حذف المستخدم:', error);
      toast.error('خطأ في الاتصال');
    }
  };

  const createUser = async () => {
    // التحقق من البيانات
    if (!newUser.username.trim()) {
      toast.error('يرجى إدخال اسم المستخدم');
      return;
    }

    if (!newUser.email.trim()) {
      toast.error('يرجى إدخال البريد الإلكتروني');
      return;
    }

    if (!newUser.fullName.trim()) {
      toast.error('يرجى إدخال الاسم الكامل');
      return;
    }

    if (!newUser.password) {
      toast.error('يرجى إدخال كلمة المرور');
      return;
    }

    if (newUser.password.length < 6) {
      toast.error('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return;
    }

    if (newUser.password !== newUser.confirmPassword) {
      toast.error('كلمات المرور غير متطابقة');
      return;
    }

    setCreateLoading(true);

    try {
      const { ipcRenderer } = window.require ? window.require('electron') : { ipcRenderer: null };

      if (ipcRenderer) {
        const result = await ipcRenderer.invoke('admin-create-user', {
          username: newUser.username.trim(),
          email: newUser.email.trim(),
          fullName: newUser.fullName.trim(),
          password: newUser.password,
          role: newUser.role
        });

        if (result.success) {
          toast.success('تم إنشاء المستخدم بنجاح');
          setShowCreateModal(false);
          setNewUser({
            username: '',
            email: '',
            fullName: '',
            password: '',
            confirmPassword: '',
            role: 'user'
          });
          fetchUsers();
        } else {
          toast.error(result.error || 'فشل في إنشاء المستخدم');
        }
      }
    } catch (error) {
      console.error('خطأ في إنشاء المستخدم:', error);
      toast.error('خطأ في الاتصال');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const handleUserUpdated = (updatedUser) => {
    setUsers(prev => prev.map(user =>
      user.id === updatedUser.id ? updatedUser : user
    ));
    setShowEditModal(false);
    setSelectedUser(null);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && user.isActive) ||
                         (filterStatus === 'inactive' && !user.isActive);
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getRoleIcon = (role) => {
    return role === 'admin' ? <Shield size={16} className="text-purple-500" /> : <User size={16} className="text-blue-500" />;
  };

  const getRoleText = (role) => {
    return role === 'admin' ? 'مدير' : 'مستخدم';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">جاري تحميل المستخدمين...</p>
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
            إدارة المستخدمين
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            إدارة حسابات المستخدمين وصلاحياتهم
          </p>
        </div>
        
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2 rtl:space-x-reverse"
        >
          <UserPlus size={16} />
          <span>إضافة مستخدم</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search size={16} className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="البحث في المستخدمين..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 rtl:pl-3 rtl:pr-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* Role Filter */}
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          >
            <option value="all">جميع الأدوار</option>
            <option value="admin">مدير</option>
            <option value="user">مستخدم</option>
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          >
            <option value="all">جميع الحالات</option>
            <option value="active">نشط</option>
            <option value="inactive">غير نشط</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  المستخدم
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  الدور
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  الحالة
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  تاريخ الإنشاء
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  آخر دخول
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  الإجراءات
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium text-sm">
                          {user.fullName.charAt(0)}
                        </span>
                      </div>
                      <div className="mr-4 rtl:mr-0 rtl:ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {user.fullName}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {user.email}
                        </div>
                        <div className="text-xs text-gray-400 dark:text-gray-500">
                          @{user.username}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      {getRoleIcon(user.role)}
                      <span className="text-sm text-gray-900 dark:text-white">
                        {getRoleText(user.role)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.isActive
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                    }`}>
                      {user.isActive ? 'نشط' : 'غير نشط'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {formatDate(user.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {user.lastLogin ? formatDate(user.lastLogin) : 'لم يسجل دخول'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <button
                        onClick={() => handleEditUser(user)}
                        className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors duration-200"
                        title="تعديل المستخدم"
                      >
                        <Edit size={16} />
                      </button>

                      <button
                        onClick={() => toggleUserStatus(user.id, user.isActive)}
                        className={`p-2 rounded-lg transition-colors duration-200 ${
                          user.isActive
                            ? 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'
                            : 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
                        }`}
                        title={user.isActive ? 'إيقاف المستخدم' : 'تفعيل المستخدم'}
                      >
                        {user.isActive ? <UserX size={16} /> : <UserCheck size={16} />}
                      </button>

                      {user.role !== 'admin' && (
                        <button
                          onClick={() => deleteUser(user.id)}
                          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200"
                          title="حذف المستخدم"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <Users size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              لا توجد مستخدمين
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {searchTerm || filterRole !== 'all' || filterStatus !== 'all'
                ? 'لا توجد نتائج تطابق البحث'
                : 'لم يتم إنشاء أي مستخدمين بعد'
              }
            </p>
          </div>
        )}
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                إضافة مستخدم جديد
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  اسم المستخدم
                </label>
                <input
                  type="text"
                  value={newUser.username}
                  onChange={(e) => setNewUser(prev => ({ ...prev, username: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="أدخل اسم المستخدم"
                  disabled={createLoading}
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  البريد الإلكتروني
                </label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="أدخل البريد الإلكتروني"
                  disabled={createLoading}
                />
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  الاسم الكامل
                </label>
                <input
                  type="text"
                  value={newUser.fullName}
                  onChange={(e) => setNewUser(prev => ({ ...prev, fullName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="أدخل الاسم الكامل"
                  disabled={createLoading}
                />
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  الدور
                </label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser(prev => ({ ...prev, role: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  disabled={createLoading}
                >
                  <option value="user">مستخدم</option>
                  <option value="admin">مدير</option>
                </select>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  كلمة المرور
                </label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="أدخل كلمة المرور"
                  disabled={createLoading}
                />
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  تأكيد كلمة المرور
                </label>
                <input
                  type="password"
                  value={newUser.confirmPassword}
                  onChange={(e) => setNewUser(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="أعد إدخال كلمة المرور"
                  disabled={createLoading}
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end space-x-3 rtl:space-x-reverse p-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                disabled={createLoading}
              >
                إلغاء
              </button>
              <button
                onClick={createUser}
                disabled={createLoading}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2 rtl:space-x-reverse disabled:opacity-50"
              >
                {createLoading ? (
                  <>
                    <Loader size={16} className="animate-spin" />
                    <span>جاري الإنشاء...</span>
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    <span>إنشاء المستخدم</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      <EditUserModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedUser(null);
        }}
        user={selectedUser}
        onUserUpdated={handleUserUpdated}
      />
    </div>
  );
};

export default UserManagement;
