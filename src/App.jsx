import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Toaster } from 'react-hot-toast';

// Store imports
import useAppStore from './store/useAppStore';
import useProductStore from './store/useProductStore';
import useSalesStore from './store/useSalesStore';
import useAuthStore from './store/useAuthStore';

// Component imports
import Layout from './components/Layout/Layout';
import LicenseGuard from './components/License/LicenseGuard';
import { LicenseProvider } from './components/License/LicenseProvider';
import ProtectedRoute from './components/Auth/ProtectedRoute';

// Page imports
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Sales from './pages/Sales';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

// Admin page imports
import AdminDashboard from './pages/Admin/AdminDashboard';
import UserManagement from './pages/Admin/UserManagement';
import LicenseManagement from './pages/Admin/LicenseManagement';
import CreateLicense from './pages/Admin/CreateLicense';

// Loading component
const LoadingScreen = () => (
  <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
    <div className="text-center">
      <div className="spinner mx-auto mb-4"></div>
      <p className="text-gray-600 dark:text-gray-400">Loading Market Manager...</p>
    </div>
  </div>
);

function App() {
  const { i18n } = useTranslation();
  const {
    theme,
    language,
    loading,
    initializeApp,
    setLanguage
  } = useAppStore();

  const { validateSession, isAuthenticated } = useAuthStore();
  const fetchProducts = useProductStore(state => state.fetchProducts);
  const fetchSales = useSalesStore(state => state.fetchSales);

  // Initialize app on mount
  useEffect(() => {
    const init = async () => {
      try {
        // Initialize app settings
        initializeApp();

        // Validate existing session
        await validateSession();

        // Set language in i18n
        if (language !== i18n.language) {
          await i18n.changeLanguage(language);
          setLanguage(language);
        }

        // Fetch initial data only if authenticated
        if (isAuthenticated) {
          await Promise.all([
            fetchProducts(),
            fetchSales(),
          ]);
        }
      } catch (error) {
        console.error('Error initializing app:', error);
      }
    };

    init();
  }, [initializeApp, language, i18n, setLanguage, fetchProducts, fetchSales, validateSession, isAuthenticated]);

  // Handle language change
  useEffect(() => {
    if (language !== i18n.language) {
      i18n.changeLanguage(language);
    }
  }, [language, i18n]);

  // Show loading screen while initializing
  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      theme === 'dark' ? 'dark' : ''
    }`}>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route
            path="/login"
            element={
              <ProtectedRoute requireAuth={false}>
                <Login />
              </ProtectedRoute>
            }
          />

          {/* إعادة توجيه من register إلى login */}
          <Route
            path="/register"
            element={<Navigate to="/login" replace />}
          />


          {/* Protected Routes */}
          <Route
            path="/*"
            element={
              <ProtectedRoute requireAuth={true}>
                <LicenseProvider>
                  <LicenseGuard>
                    <Layout>
                      <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/products" element={<Products />} />
                        <Route path="/sales" element={<Sales />} />
                        <Route path="/reports" element={<Reports />} />
                        <Route path="/settings" element={<Settings />} />

                        {/* Admin Routes */}
                        <Route
                          path="/admin"
                          element={
                            <ProtectedRoute requireAdmin={true}>
                              <AdminDashboard />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/admin/dashboard"
                          element={
                            <ProtectedRoute requireAdmin={true}>
                              <AdminDashboard />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/admin/users"
                          element={
                            <ProtectedRoute requireAdmin={true}>
                              <UserManagement />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/admin/licenses"
                          element={
                            <ProtectedRoute requireAdmin={true}>
                              <LicenseManagement />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/admin/licenses/create"
                          element={
                            <ProtectedRoute requireAdmin={true}>
                              <CreateLicense />
                            </ProtectedRoute>
                          }
                        />
                      </Routes>
                    </Layout>
                  </LicenseGuard>
                </LicenseProvider>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>

      {/* Toast notifications */}
      <Toaster
        position="top-right"
        reverseOrder={false}
        gutter={8}
        containerClassName=""
        containerStyle={{}}
        toastOptions={{
          // Define default options
          className: '',
          duration: 4000,
          style: {
            background: theme === 'dark' ? '#374151' : '#ffffff',
            color: theme === 'dark' ? '#f9fafb' : '#111827',
            border: `1px solid ${theme === 'dark' ? '#4b5563' : '#e5e7eb'}`,
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '500',
          },
          // Default options for specific types
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10b981',
              secondary: '#ffffff',
            },
          },
          error: {
            duration: 5000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#ffffff',
            },
          },
          loading: {
            duration: Infinity,
          },
        }}
      />
    </div>
  );
}

export default App;
