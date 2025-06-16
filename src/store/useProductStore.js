import { create } from 'zustand';
import { getData, addItem, updateItem, deleteItem } from '../utils/database';

const useProductStore = create((set, get) => ({
  products: [],
  loading: false,
  searchTerm: '',
  selectedCategory: '',
  categories: [],

  // Fetch all products
  fetchProducts: async () => {
    set({ loading: true });
    try {
      const products = await getData('products');
      const categories = [...new Set(products.map(p => p.category).filter(Boolean))];
      set({ products, categories, loading: false });
    } catch (error) {
      console.error('Error fetching products:', error);
      set({ loading: false });
    }
  },

  // Add new product
  addProduct: async (productData) => {
    try {
      const result = await addItem('products', {
        name: productData.name,
        name_ar: productData.name_ar || '',
        barcode: productData.barcode || '',
        category: productData.category || '',
        price: productData.price,
        cost: productData.cost || 0,
        stock: productData.stock || 0,
        min_stock: productData.min_stock || 5,
        description: productData.description || ''
      });

      // Refresh products list
      get().fetchProducts();
      return result;
    } catch (error) {
      console.error('Error adding product:', error);
      return { success: false, error: error.message };
    }
  },

  // Update product
  updateProduct: async (id, productData) => {
    try {
      const result = await updateItem('products', id, {
        name: productData.name,
        name_ar: productData.name_ar || '',
        barcode: productData.barcode || '',
        category: productData.category || '',
        price: productData.price,
        cost: productData.cost || 0,
        stock: productData.stock || 0,
        min_stock: productData.min_stock || 5,
        description: productData.description || ''
      });

      // Refresh products list
      get().fetchProducts();
      return result;
    } catch (error) {
      console.error('Error updating product:', error);
      return { success: false, error: error.message };
    }
  },

  // Delete product
  deleteProduct: async (id) => {
    try {
      const result = await deleteItem('products', id);

      // Refresh products list
      get().fetchProducts();
      return result;
    } catch (error) {
      console.error('Error deleting product:', error);
      return { success: false, error: error.message };
    }
  },

  // Update product stock
  updateStock: async (id, newStock) => {
    try {
      const result = await updateItem('products', id, { stock: newStock });

      // Update local state
      set((state) => ({
        products: state.products.map(p =>
          p.id === id ? { ...p, stock: newStock } : p
        )
      }));

      return result;
    } catch (error) {
      console.error('Error updating stock:', error);
      return { success: false, error: error.message };
    }
  },

  // Search and filter
  setSearchTerm: (term) => set({ searchTerm: term }),
  setSelectedCategory: (category) => set({ selectedCategory: category }),

  // Get filtered products
  getFilteredProducts: () => {
    const { products, searchTerm, selectedCategory } = get();
    return products.filter(product => {
      const matchesSearch = !searchTerm || 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.name_ar && product.name_ar.includes(searchTerm)) ||
        (product.barcode && product.barcode.includes(searchTerm));
      
      const matchesCategory = !selectedCategory || product.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  },

  // Get low stock products
  getLowStockProducts: () => {
    const { products } = get();
    return products.filter(product => product.stock <= product.min_stock);
  },

  // Get product by ID
  getProductById: (id) => {
    const { products } = get();
    return products.find(product => product.id === id);
  },

  // Get product by barcode
  getProductByBarcode: (barcode) => {
    const { products } = get();
    return products.find(product => product.barcode === barcode);
  },
}));

export default useProductStore;
