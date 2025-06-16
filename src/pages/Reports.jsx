import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Calendar, 
  Download, 
  BarChart3, 
  TrendingUp,
  Package,
  DollarSign,
  FileText
} from 'lucide-react';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';
import {
  LineChart,
  Line,
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

import {
  getSalesByDateRange,
  getTopSellingProducts,
  getCategorySalesData,
  getMonthlySalesData,
  getSalesStatistics
} from '../utils/database';
import { formatCurrency, formatNumber, exportToCSV } from '../utils/helpers';

const Reports = () => {
  const { t } = useTranslation();
  
  const [dateRange, setDateRange] = useState({
    from: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    to: format(new Date(), 'yyyy-MM-dd')
  });
  
  const [reportData, setReportData] = useState({
    sales: [],
    topProducts: [],
    categorySales: [],
    monthlySales: [],
    summary: {
      totalRevenue: 0,
      totalSales: 0,
      averageSale: 0,
      totalItems: 0
    }
  });
  
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    generateReport();
  }, [dateRange]);

  const generateReport = async () => {
    setLoading(true);
    try {
      const [sales, topProducts, categorySales, monthlySales, salesStats] = await Promise.all([
        getSalesByDateRange(dateRange.from, dateRange.to),
        getTopSellingProducts(10),
        getCategorySalesData(),
        getMonthlySalesData(),
        getSalesStatistics()
      ]);

      // Calculate summary
      const totalRevenue = sales.reduce((sum, sale) => sum + (sale.total_amount || 0), 0);
      const totalSales = sales.length;
      const averageSale = totalSales > 0 ? totalRevenue / totalSales : 0;

      // Calculate total items sold
      const totalItems = sales.reduce((sum, sale) => {
        if (sale.items && Array.isArray(sale.items)) {
          return sum + sale.items.reduce((itemSum, item) => itemSum + (item.quantity || 0), 0);
        }
        return sum;
      }, 0);

      setReportData({
        sales,
        topProducts,
        categorySales,
        monthlySales,
        summary: {
          totalRevenue,
          totalSales,
          averageSale,
          totalItems
        }
      });
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateRangeChange = (field, value) => {
    setDateRange(prev => ({ ...prev, [field]: value }));
  };

  const setQuickDateRange = (days) => {
    const to = format(new Date(), 'yyyy-MM-dd');
    const from = format(subDays(new Date(), days), 'yyyy-MM-dd');
    setDateRange({ from, to });
  };

  const setMonthRange = () => {
    const now = new Date();
    const from = format(startOfMonth(now), 'yyyy-MM-dd');
    const to = format(endOfMonth(now), 'yyyy-MM-dd');
    setDateRange({ from, to });
  };

  const exportReport = () => {
    const exportData = reportData.sales.map(sale => ({
      'Invoice Number': sale.invoice_number,
      'Date': format(new Date(sale.created_at), 'yyyy-MM-dd HH:mm'),
      'Customer': sale.customer_name || 'Walk-in',
      'Total Amount': sale.total_amount,
      'Payment Method': sale.payment_method,
      'Items': sale.items_summary || ''
    }));
    
    exportToCSV(exportData, `sales-report-${dateRange.from}-to-${dateRange.to}.csv`);
  };

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
            {title}
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {value}
          </p>
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon size={24} className="text-white" />
        </div>
      </div>
    </div>
  );

  const tabs = [
    { id: 'overview', name: 'Overview', icon: BarChart3 },
    { id: 'sales', name: 'Sales Details', icon: DollarSign },
    { id: 'products', name: 'Product Performance', icon: Package },
  ];

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-200 dark:bg-gray-700 h-32 rounded-lg"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="bg-gray-200 dark:bg-gray-700 h-80 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('reports.title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Sales and performance analytics
          </p>
        </div>
        
        <button
          onClick={exportReport}
          className="btn-primary flex items-center space-x-2 rtl:space-x-reverse"
        >
          <Download size={16} />
          <span>{t('common.export')}</span>
        </button>
      </div>

      {/* Date Range Selector */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <Calendar size={20} className="text-gray-500" />
            <span className="font-medium text-gray-700 dark:text-gray-300">
              {t('reports.dateRange')}:
            </span>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <label className="text-sm text-gray-600 dark:text-gray-400">
                {t('reports.from')}:
              </label>
              <input
                type="date"
                value={dateRange.from}
                onChange={(e) => handleDateRangeChange('from', e.target.value)}
                className="form-input py-1"
              />
            </div>
            
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <label className="text-sm text-gray-600 dark:text-gray-400">
                {t('reports.to')}:
              </label>
              <input
                type="date"
                value={dateRange.to}
                onChange={(e) => handleDateRangeChange('to', e.target.value)}
                className="form-input py-1"
              />
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setQuickDateRange(7)}
              className="btn-secondary text-sm py-1 px-3"
            >
              Last 7 days
            </button>
            <button
              onClick={() => setQuickDateRange(30)}
              className="btn-secondary text-sm py-1 px-3"
            >
              Last 30 days
            </button>
            <button
              onClick={setMonthRange}
              className="btn-secondary text-sm py-1 px-3"
            >
              This month
            </button>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title={t('reports.totalRevenue')}
          value={formatCurrency(reportData.summary.totalRevenue)}
          icon={DollarSign}
          color="bg-green-500"
        />
        <StatCard
          title={t('reports.totalItems')}
          value={formatNumber(reportData.summary.totalSales, 0)}
          icon={FileText}
          color="bg-blue-500"
        />
        <StatCard
          title={t('reports.averageSale')}
          value={formatCurrency(reportData.summary.averageSale)}
          icon={TrendingUp}
          color="bg-purple-500"
        />
        <StatCard
          title="Total Products"
          value={formatNumber(reportData.topProducts.length, 0)}
          icon={Package}
          color="bg-orange-500"
        />
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 rtl:space-x-reverse px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 rtl:space-x-reverse py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  <Icon size={16} />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Monthly Sales Chart */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  {t('dashboard.monthlyRevenue')}
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={reportData.monthlySales}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Line 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Category Sales */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  {t('reports.salesByCategory')}
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={reportData.categorySales}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="revenue"
                    >
                      {reportData.categorySales.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={`hsl(${index * 45}, 70%, 50%)`} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {activeTab === 'sales' && (
            <div className="overflow-x-auto">
              <table className="table">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="table-header">Invoice</th>
                    <th className="table-header">Date</th>
                    <th className="table-header">Customer</th>
                    <th className="table-header">Amount</th>
                    <th className="table-header">Payment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {reportData.sales.map((sale) => (
                    <tr key={sale.id}>
                      <td className="table-cell font-medium">
                        {sale.invoice_number}
                      </td>
                      <td className="table-cell">
                        {format(new Date(sale.created_at), 'MMM dd, yyyy HH:mm')}
                      </td>
                      <td className="table-cell">
                        {sale.customer_name || 'Walk-in Customer'}
                      </td>
                      <td className="table-cell font-medium">
                        {formatCurrency(sale.total_amount)}
                      </td>
                      <td className="table-cell">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                          {sale.payment_method.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'products' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {t('reports.topSellingProducts')}
              </h3>
              <div className="space-y-4">
                {reportData.topProducts.map((product, index) => (
                  <div key={product.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-4 rtl:space-x-reverse">
                      <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-primary-600 dark:text-primary-400">
                          {index + 1}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {product.name}
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {formatNumber(product.total_sold || 0, 0)} units sold
                        </p>
                      </div>
                    </div>
                    <div className="text-right rtl:text-left">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {formatCurrency(product.total_revenue || 0)}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {formatCurrency(product.price)} each
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;
