// Data utility functions for Electron IPC communication

const { ipcRenderer } = window.require ? window.require('electron') : { ipcRenderer: null };

// Check if we're in Electron environment
const isElectron = () => {
  return ipcRenderer !== null;
};

// Get data by type
export const getData = async (type) => {
  if (!isElectron()) {
    // Fallback for development in browser - use localStorage
    const data = localStorage.getItem(`market-manager-${type}`);
    return data ? JSON.parse(data) : [];
  }

  try {
    return await ipcRenderer.invoke('get-data', type);
  } catch (error) {
    console.error('Error getting data:', error);
    return [];
  }
};

// Save data by type
export const saveData = async (type, data) => {
  if (!isElectron()) {
    // Fallback for development in browser - use localStorage
    localStorage.setItem(`market-manager-${type}`, JSON.stringify(data));
    return { success: true };
  }

  try {
    return await ipcRenderer.invoke('save-data', type, data);
  } catch (error) {
    console.error('Error saving data:', error);
    return { success: false, error: error.message };
  }
};

// Add new item
export const addItem = async (type, item) => {
  if (!isElectron()) {
    // Fallback for development in browser
    const data = await getData(type);
    const maxId = data.length > 0 ? Math.max(...data.map(i => i.id || 0)) : 0;
    const newItem = {
      ...item,
      id: maxId + 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    data.push(newItem);
    await saveData(type, data);
    return { success: true, id: newItem.id };
  }

  try {
    return await ipcRenderer.invoke('add-item', type, item);
  } catch (error) {
    console.error('Error adding item:', error);
    return { success: false, error: error.message };
  }
};

// Update item
export const updateItem = async (type, id, updates) => {
  if (!isElectron()) {
    // Fallback for development in browser
    const data = await getData(type);
    const index = data.findIndex(item => item.id === id);
    if (index === -1) return { success: false, error: 'Item not found' };

    data[index] = { ...data[index], ...updates, updated_at: new Date().toISOString() };
    await saveData(type, data);
    return { success: true };
  }

  try {
    return await ipcRenderer.invoke('update-item', type, id, updates);
  } catch (error) {
    console.error('Error updating item:', error);
    return { success: false, error: error.message };
  }
};

// Delete item
export const deleteItem = async (type, id) => {
  if (!isElectron()) {
    // Fallback for development in browser
    const data = await getData(type);
    const filteredData = data.filter(item => item.id !== id);
    await saveData(type, filteredData);
    return { success: true };
  }

  try {
    return await ipcRenderer.invoke('delete-item', type, id);
  } catch (error) {
    console.error('Error deleting item:', error);
    return { success: false, error: error.message };
  }
};

// Export data
export const exportData = async (format = 'json') => {
  if (!isElectron()) {
    console.warn('Export not available in browser mode');
    return { success: false, error: 'Not in Electron environment' };
  }

  try {
    return await ipcRenderer.invoke('export-data', format);
  } catch (error) {
    console.error('Export error:', error);
    return { success: false, error: error.message };
  }
};

// Import data
export const importData = async () => {
  if (!isElectron()) {
    console.warn('Import not available in browser mode');
    return { success: false, error: 'Not in Electron environment' };
  }

  try {
    return await ipcRenderer.invoke('import-data');
  } catch (error) {
    console.error('Import error:', error);
    return { success: false, error: error.message };
  }
};

// Utility functions for common data operations

// Get all products
export const getAllProducts = async () => {
  const products = await getData('products');
  return products.sort((a, b) => a.name.localeCompare(b.name));
};

// Get product by ID
export const getProductById = async (id) => {
  const products = await getData('products');
  return products.find(p => p.id === id);
};

// Get products by category
export const getProductsByCategory = async (category) => {
  const products = await getData('products');
  return products.filter(p => p.category === category).sort((a, b) => a.name.localeCompare(b.name));
};

// Get low stock products
export const getLowStockProducts = async () => {
  const products = await getData('products');
  return products.filter(p => p.stock <= p.min_stock).sort((a, b) => a.stock - b.stock);
};

// Get sales by date range
export const getSalesByDateRange = async (startDate, endDate) => {
  const sales = await getData('sales');
  return sales.filter(sale => {
    const saleDate = new Date(sale.created_at).toISOString().split('T')[0];
    return saleDate >= startDate && saleDate <= endDate;
  }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
};

// Get top selling products
export const getTopSellingProducts = async (limit = 10) => {
  const products = await getData('products');
  const sales = await getData('sales');

  // Calculate sales data for each product
  const productSales = products.map(product => {
    let totalSold = 0;
    let totalRevenue = 0;

    sales.forEach(sale => {
      if (sale.items) {
        sale.items.forEach(item => {
          if (item.product.id === product.id) {
            totalSold += item.quantity;
            totalRevenue += item.total;
          }
        });
      }
    });

    return {
      ...product,
      total_sold: totalSold,
      total_revenue: totalRevenue
    };
  });

  return productSales
    .sort((a, b) => b.total_sold - a.total_sold)
    .slice(0, limit);
};

// Calculate profit for sales
const calculateSalesProfit = async (salesData) => {
  const products = await getData('products');
  let totalProfit = 0;

  salesData.forEach(sale => {
    if (sale.items && Array.isArray(sale.items)) {
      sale.items.forEach(item => {
        const product = products.find(p => p.id === item.product.id);
        if (product && product.cost) {
          const profit = (item.price - product.cost) * item.quantity;
          totalProfit += profit;
        }
      });
    }
  });

  return totalProfit;
};

// Get sales statistics with profit calculation
export const getSalesStatistics = async () => {
  const sales = await getData('sales');
  const today = new Date().toISOString().split('T')[0];
  const thisMonth = new Date().toISOString().substring(0, 7); // YYYY-MM

  const totalSales = sales.length;
  const totalRevenue = sales.reduce((sum, sale) => sum + (sale.total_amount || 0), 0);
  const averageSale = totalSales > 0 ? totalRevenue / totalSales : 0;

  // Today's data
  const todaySales = sales.filter(sale =>
    new Date(sale.created_at).toISOString().split('T')[0] === today
  );
  const todayRevenue = todaySales.reduce((sum, sale) => sum + (sale.total_amount || 0), 0);
  const todayProfit = await calculateSalesProfit(todaySales);

  // This month's data
  const monthSales = sales.filter(sale =>
    new Date(sale.created_at).toISOString().substring(0, 7) === thisMonth
  );
  const monthRevenue = monthSales.reduce((sum, sale) => sum + (sale.total_amount || 0), 0);
  const monthProfit = await calculateSalesProfit(monthSales);

  // Total profit
  const totalProfit = await calculateSalesProfit(sales);

  return [{
    total_sales: totalSales,
    total_revenue: totalRevenue,
    total_profit: totalProfit,
    average_sale: averageSale,
    today_sales: todaySales.length,
    today_revenue: todayRevenue,
    today_profit: todayProfit,
    month_sales: monthSales.length,
    month_revenue: monthRevenue,
    month_profit: monthProfit
  }];
};

// Get monthly sales data for charts
export const getMonthlySalesData = async () => {
  const sales = await getData('sales');
  const monthlyData = {};

  sales.forEach(sale => {
    const month = new Date(sale.created_at).toISOString().substring(0, 7); // YYYY-MM
    if (!monthlyData[month]) {
      monthlyData[month] = { month, sales_count: 0, revenue: 0 };
    }
    monthlyData[month].sales_count++;
    monthlyData[month].revenue += sale.total_amount || 0;
  });

  return Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month));
};

// Get daily sales data for current month
export const getDailySalesData = async () => {
  const sales = await getData('sales');
  const currentMonth = new Date().toISOString().substring(0, 7); // YYYY-MM
  const dailyData = {};

  sales.forEach(sale => {
    const saleDate = new Date(sale.created_at);
    const saleMonth = saleDate.toISOString().substring(0, 7);

    if (saleMonth === currentMonth) {
      const date = saleDate.toISOString().split('T')[0]; // YYYY-MM-DD
      if (!dailyData[date]) {
        dailyData[date] = { date, sales_count: 0, revenue: 0 };
      }
      dailyData[date].sales_count++;
      dailyData[date].revenue += sale.total_amount || 0;
    }
  });

  return Object.values(dailyData).sort((a, b) => a.date.localeCompare(b.date));
};

// Get category sales data
export const getCategorySalesData = async () => {
  const products = await getData('products');
  const sales = await getData('sales');
  const categoryData = {};

  sales.forEach(sale => {
    if (sale.items) {
      sale.items.forEach(item => {
        const product = products.find(p => p.id === item.product.id);
        if (product && product.category) {
          if (!categoryData[product.category]) {
            categoryData[product.category] = {
              category: product.category,
              items_sold: 0,
              revenue: 0
            };
          }
          categoryData[product.category].items_sold += item.quantity;
          categoryData[product.category].revenue += item.total;
        }
      });
    }
  });

  return Object.values(categoryData).sort((a, b) => b.revenue - a.revenue);
};

// Settings operations
export const getSetting = async (key) => {
  const settings = await getData('settings');
  return settings[key];
};

export const setSetting = async (key, value) => {
  const settings = await getData('settings');
  settings[key] = value;
  return await saveData('settings', settings);
};

export const getAllSettings = async () => {
  return await getData('settings');
};

// Get database file path
export const getDbPath = async () => {
  if (!isElectron()) {
    return 'Browser localStorage (no file path)';
  }

  try {
    return await ipcRenderer.invoke('get-db-path');
  } catch (error) {
    console.error('Error getting database path:', error);
    return 'Error getting path';
  }
};

// Open database file location
export const openDbLocation = async () => {
  if (!isElectron()) {
    console.log('Database location not available in browser mode');
    return { success: false, error: 'Not in Electron environment' };
  }

  try {
    return await ipcRenderer.invoke('open-db-location');
  } catch (error) {
    console.error('Error opening database location:', error);
    return { success: false, error: error.message };
  }
};
