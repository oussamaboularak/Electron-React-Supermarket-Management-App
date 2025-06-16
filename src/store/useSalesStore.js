import { create } from 'zustand';
import { getData, addItem, updateItem } from '../utils/database';
import { format } from 'date-fns';

const useSalesStore = create((set, get) => ({
  sales: [],
  currentSale: {
    items: [],
    customer: { name: '', phone: '' },
    paymentMethod: 'cash',
    discount: 0,
    tax: 0,
  },
  loading: false,

  // Fetch all sales
  fetchSales: async () => {
    set({ loading: true });
    try {
      const sales = await getData('sales');
      set({ sales, loading: false });
    } catch (error) {
      console.error('Error fetching sales:', error);
      set({ loading: false });
    }
  },

  // Add item to current sale
  addItemToSale: (product, quantity = 1) => {
    set((state) => {
      const existingItemIndex = state.currentSale.items.findIndex(
        item => item.product.id === product.id
      );

      let newItems;
      if (existingItemIndex >= 0) {
        // Update existing item
        newItems = state.currentSale.items.map((item, index) =>
          index === existingItemIndex
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        // Add new item
        newItems = [
          ...state.currentSale.items,
          {
            product,
            quantity,
            unitPrice: product.price,
            total: product.price * quantity,
          }
        ];
      }

      return {
        currentSale: {
          ...state.currentSale,
          items: newItems,
        }
      };
    });
  },

  // Remove item from current sale
  removeItemFromSale: (productId) => {
    set((state) => ({
      currentSale: {
        ...state.currentSale,
        items: state.currentSale.items.filter(item => item.product.id !== productId),
      }
    }));
  },

  // Update item quantity
  updateItemQuantity: (productId, quantity) => {
    if (quantity <= 0) {
      get().removeItemFromSale(productId);
      return;
    }

    set((state) => ({
      currentSale: {
        ...state.currentSale,
        items: state.currentSale.items.map(item =>
          item.product.id === productId
            ? { ...item, quantity, total: item.unitPrice * quantity }
            : item
        ),
      }
    }));
  },

  // Update customer info
  updateCustomer: (customerData) => {
    set((state) => ({
      currentSale: {
        ...state.currentSale,
        customer: { ...state.currentSale.customer, ...customerData },
      }
    }));
  },

  // Update payment method
  setPaymentMethod: (method) => {
    set((state) => ({
      currentSale: {
        ...state.currentSale,
        paymentMethod: method,
      }
    }));
  },

  // Update discount
  setDiscount: (discount) => {
    set((state) => ({
      currentSale: {
        ...state.currentSale,
        discount: Math.max(0, discount),
      }
    }));
  },

  // Update tax
  setTax: (tax) => {
    set((state) => ({
      currentSale: {
        ...state.currentSale,
        tax: Math.max(0, tax),
      }
    }));
  },

  // Calculate totals
  calculateTotals: () => {
    const { currentSale } = get();
    const subtotal = currentSale.items.reduce((sum, item) => sum + item.total, 0);
    const discountAmount = (subtotal * currentSale.discount) / 100;
    const taxAmount = ((subtotal - discountAmount) * currentSale.tax) / 100;
    const grandTotal = subtotal - discountAmount + taxAmount;

    return {
      subtotal,
      discountAmount,
      taxAmount,
      grandTotal,
    };
  },

  // Complete sale
  completeSale: async () => {
    const { currentSale } = get();
    const { grandTotal } = get().calculateTotals();

    if (currentSale.items.length === 0) {
      return { success: false, error: 'No items in sale' };
    }

    try {
      // Generate invoice number
      const invoiceNumber = `INV-${Date.now()}`;

      // Create sale object
      const saleData = {
        invoice_number: invoiceNumber,
        total_amount: grandTotal,
        discount: currentSale.discount,
        tax: currentSale.tax,
        payment_method: currentSale.paymentMethod,
        customer_name: currentSale.customer.name || '',
        customer_phone: currentSale.customer.phone || '',
        items: currentSale.items
      };

      // Add sale
      const saleResult = await addItem('sales', saleData);

      if (!saleResult.success) {
        return saleResult;
      }

      // Update product stock
      const products = await getData('products');
      for (const item of currentSale.items) {
        const productIndex = products.findIndex(p => p.id === item.product.id);
        if (productIndex !== -1) {
          products[productIndex].stock -= item.quantity;
          await updateItem('products', item.product.id, { stock: products[productIndex].stock });
        }
      }

      // Clear current sale
      set({
        currentSale: {
          items: [],
          customer: { name: '', phone: '' },
          paymentMethod: 'cash',
          discount: 0,
          tax: 0,
        }
      });

      // Refresh sales list
      get().fetchSales();

      return { success: true, invoiceNumber, saleId: saleResult.id };
    } catch (error) {
      console.error('Error completing sale:', error);
      return { success: false, error: error.message };
    }
  },

  // Clear current sale
  clearSale: () => {
    set({
      currentSale: {
        items: [],
        customer: { name: '', phone: '' },
        paymentMethod: 'cash',
        discount: 0,
        tax: 0,
      }
    });
  },

  // Get sales by date range
  getSalesByDateRange: async (startDate, endDate) => {
    try {
      const sales = await getData('sales');
      return sales.filter(sale => {
        const saleDate = new Date(sale.created_at).toISOString().split('T')[0];
        return saleDate >= startDate && saleDate <= endDate;
      }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } catch (error) {
      console.error('Error fetching sales by date range:', error);
      return [];
    }
  },

  // Get today's sales
  getTodaysSales: async () => {
    const today = format(new Date(), 'yyyy-MM-dd');
    return get().getSalesByDateRange(today, today);
  },

  // Get sales statistics
  getSalesStats: async () => {
    try {
      const sales = await getData('sales');
      const today = format(new Date(), 'yyyy-MM-dd');
      const thisMonth = format(new Date(), 'yyyy-MM');

      const todaySales = sales.filter(sale =>
        new Date(sale.created_at).toISOString().split('T')[0] === today
      );

      const monthSales = sales.filter(sale =>
        new Date(sale.created_at).toISOString().substring(0, 7) === thisMonth
      );

      const todayTotal = todaySales.reduce((sum, sale) => sum + (sale.total_amount || 0), 0);
      const monthTotal = monthSales.reduce((sum, sale) => sum + (sale.total_amount || 0), 0);
      const totalAmount = sales.reduce((sum, sale) => sum + (sale.total_amount || 0), 0);

      return {
        today: { count: todaySales.length, total: todayTotal },
        thisMonth: { count: monthSales.length, total: monthTotal },
        total: { count: sales.length, total: totalAmount },
      };
    } catch (error) {
      console.error('Error fetching sales stats:', error);
      return {
        today: { count: 0, total: 0 },
        thisMonth: { count: 0, total: 0 },
        total: { count: 0, total: 0 },
      };
    }
  },
}));

export default useSalesStore;
