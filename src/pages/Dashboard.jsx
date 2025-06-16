import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Package,
  ShoppingCart,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Users,
  Calendar,
  BarChart3,
  Target
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

import useProductStore from '../store/useProductStore';
import useSalesStore from '../store/useSalesStore';
import { formatCurrency, formatNumber } from '../utils/helpers';
import {
  getSalesStatistics,
  getMonthlySalesData,
  getDailySalesData,
  getCategorySalesData,
  getTopSellingProducts
} from '../utils/database';

const StatCard = ({ title, value, icon: Icon, color, change, changeType }) => {
  const isPositive = changeType === 'positive';
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 card-hover">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
            {title}
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
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
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon size={24} className="text-white" />
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { t } = useTranslation();
  const { products, getLowStockProducts } = useProductStore();
  const { getSalesStats } = useSalesStore();
  
  const [stats, setStats] = useState({
    today: { count: 0, total: 0, profit: 0 },
    thisMonth: { count: 0, total: 0, profit: 0 },
    total: { count: 0, total: 0, profit: 0 }
  });
  const [monthlySales, setMonthlySales] = useState([]);
  const [dailySales, setDailySales] = useState([]);
  const [categorySales, setCategorySales] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        const [
          salesStatsData,
          monthlyData,
          dailyData,
          categoryData,
          topProductsData
        ] = await Promise.all([
          getSalesStatistics(),
          getMonthlySalesData(),
          getDailySalesData(),
          getCategorySalesData(),
          getTopSellingProducts(5)
        ]);

        // Extract stats from the array returned by getSalesStatistics
        const salesStats = salesStatsData[0] || {
          today_sales: 0,
          today_revenue: 0,
          today_profit: 0,
          month_sales: 0,
          month_revenue: 0,
          month_profit: 0,
          total_sales: 0,
          total_revenue: 0,
          total_profit: 0
        };

        setStats({
          today: {
            count: salesStats.today_sales,
            total: salesStats.today_revenue,
            profit: salesStats.today_profit
          },
          thisMonth: {
            count: salesStats.month_sales,
            total: salesStats.month_revenue,
            profit: salesStats.month_profit
          },
          total: {
            count: salesStats.total_sales,
            total: salesStats.total_revenue,
            profit: salesStats.total_profit
          }
        });
        setMonthlySales(monthlyData);
        setDailySales(dailyData);
        setCategorySales(categoryData);
        setTopProducts(topProductsData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const lowStockProducts = getLowStockProducts();

  // Chart colors
  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-200 dark:bg-gray-700 h-32 rounded-lg"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-200 dark:bg-gray-700 h-80 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">{t('dashboard.welcome')}</h1>
        <p className="text-primary-100">
          {t('dashboard.title')} - {new Date().toLocaleDateString()}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCard
          title={t('dashboard.totalProducts')}
          value={formatNumber(products.length, 0)}
          icon={Package}
          color="bg-blue-500"
        />
        <StatCard
          title={t('dashboard.totalSales')}
          value={formatCurrency(stats.total.total)}
          icon={DollarSign}
          color="bg-green-500"
          change={`${formatNumber(stats.today.count, 0)} ${t('dashboard.dailySales')}`}
          changeType="positive"
        />
        <StatCard
          title={t('dashboard.lowStock')}
          value={formatNumber(lowStockProducts.length, 0)}
          icon={AlertTriangle}
          color={lowStockProducts.length > 0 ? "bg-red-500" : "bg-gray-500"}
        />
        <StatCard
          title="الربح اليومي"
          value={formatCurrency(stats.today.profit)}
          icon={TrendingUp}
          color="bg-purple-500"
          change={`${formatNumber(stats.today.count, 0)} مبيعات`}
          changeType="positive"
        />
        <StatCard
          title="الربح الشهري"
          value={formatCurrency(stats.thisMonth.profit)}
          icon={Target}
          color="bg-indigo-500"
          change={`${formatNumber(stats.thisMonth.count, 0)} مبيعات`}
          changeType="positive"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Sales Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {t('dashboard.monthlyRevenue')}
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={monthlySales}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip 
                formatter={(value) => [formatCurrency(value), t('common.total')]}
              />
              <Area 
                type="monotone" 
                dataKey="revenue" 
                stroke="#3b82f6" 
                fill="#3b82f6" 
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Daily Sales Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {t('dashboard.dailySales')}
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dailySales}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip 
                formatter={(value) => [formatCurrency(value), t('common.total')]}
              />
              <Bar dataKey="revenue" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category Sales Pie Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {t('reports.salesByCategory')}
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categorySales}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="revenue"
              >
                {categorySales.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatCurrency(value)} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Top Products */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {t('dashboard.topProducts')}
          </h3>
          <div className="space-y-3">
            {topProducts.map((product, index) => (
              <div key={product.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-primary-600 dark:text-primary-400">
                      {index + 1}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {product.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatNumber(product.total_sold, 0)} sold
                    </p>
                  </div>
                </div>
                <div className="text-right rtl:text-left">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatCurrency(product.total_revenue)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Low Stock Alert */}
      {lowStockProducts.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="text-red-500 mr-3 rtl:mr-0 rtl:ml-3" size={20} />
            <div>
              <h4 className="text-sm font-medium text-red-800 dark:text-red-200">
                {t('products.lowStockWarning')}
              </h4>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                {lowStockProducts.length} products are running low on stock
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
