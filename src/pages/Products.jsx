import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Package,
  AlertTriangle,
  Filter,
  Download,
  Upload
} from 'lucide-react';
import toast from 'react-hot-toast';

import useProductStore from '../store/useProductStore';
import ProductModal from '../components/Products/ProductModal';
import { formatCurrency, formatNumber, exportToCSV } from '../utils/helpers';
import { cn } from '../utils/helpers';

const Products = () => {
  const { t } = useTranslation();
  const {
    products,
    loading,
    searchTerm,
    selectedCategory,
    categories,
    setSearchTerm,
    setSelectedCategory,
    getFilteredProducts,
    deleteProduct,
    fetchProducts
  } = useProductStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState([]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const filteredProducts = getFilteredProducts();

  const handleAddProduct = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleDeleteProduct = async (product) => {
    if (window.confirm(t('products.deleteConfirm'))) {
      const result = await deleteProduct(product.id);
      if (result.success) {
        toast.success(t('products.productDeleted'));
      } else {
        toast.error(result.error || t('errors.generalError'));
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedProducts.length === 0) return;
    
    if (window.confirm(`Delete ${selectedProducts.length} products?`)) {
      for (const productId of selectedProducts) {
        await deleteProduct(productId);
      }
      setSelectedProducts([]);
      toast.success(`${selectedProducts.length} products deleted`);
    }
  };

  const handleSelectProduct = (productId) => {
    setSelectedProducts(prev => 
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleSelectAll = () => {
    if (selectedProducts.length === filteredProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(filteredProducts.map(p => p.id));
    }
  };

  const handleExportProducts = () => {
    const exportData = filteredProducts.map(product => ({
      Name: product.name,
      'Name (Arabic)': product.name_ar || '',
      Barcode: product.barcode || '',
      Category: product.category || '',
      Price: product.price,
      Cost: product.cost || 0,
      Stock: product.stock,
      'Min Stock': product.min_stock,
      Description: product.description || '',
      'Created At': new Date(product.created_at).toLocaleDateString()
    }));
    
    exportToCSV(exportData, 'products.csv');
    toast.success(t('settings.dataExported'));
  };

  const getStockStatus = (product) => {
    if (product.stock === 0) {
      return { status: 'out', color: 'text-red-600 bg-red-100 dark:bg-red-900/20' };
    } else if (product.stock <= product.min_stock) {
      return { status: 'low', color: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20' };
    }
    return { status: 'good', color: 'text-green-600 bg-green-100 dark:bg-green-900/20' };
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
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
            {t('products.title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {formatNumber(filteredProducts.length, 0)} products
          </p>
        </div>
        
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <button
            onClick={handleExportProducts}
            className="btn-secondary flex items-center space-x-2 rtl:space-x-reverse"
          >
            <Download size={16} />
            <span>{t('common.export')}</span>
          </button>
          
          <button
            onClick={handleAddProduct}
            className="btn-primary flex items-center space-x-2 rtl:space-x-reverse"
          >
            <Plus size={16} />
            <span>{t('products.addProduct')}</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search 
                size={18} 
                className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
              />
              <input
                type="text"
                placeholder={t('common.search')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input pl-10 rtl:pl-4 rtl:pr-10"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="sm:w-48">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="form-input"
            >
              <option value="">{t('common.category')} - All</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedProducts.length > 0 && (
          <div className="mt-4 flex items-center justify-between p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
            <span className="text-sm text-primary-700 dark:text-primary-300">
              {selectedProducts.length} products selected
            </span>
            <button
              onClick={handleBulkDelete}
              className="text-sm text-red-600 hover:text-red-700 font-medium"
            >
              Delete Selected
            </button>
          </div>
        )}
      </div>

      {/* Products Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="table-container">
          <table className="table">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="table-header w-12">
                  <input
                    type="checkbox"
                    checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                </th>
                <th className="table-header">{t('common.name')}</th>
                <th className="table-header">{t('common.category')}</th>
                <th className="table-header">{t('common.price')}</th>
                <th className="table-header">{t('common.stock')}</th>
                <th className="table-header">Status</th>
                <th className="table-header">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredProducts.map((product) => {
                const stockStatus = getStockStatus(product);
                return (
                  <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="table-cell">
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(product.id)}
                        onChange={() => handleSelectProduct(product.id)}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                    </td>
                    <td className="table-cell">
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {product.name}
                        </div>
                        {product.name_ar && (
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {product.name_ar}
                          </div>
                        )}
                        {product.barcode && (
                          <div className="text-xs text-gray-400">
                            {product.barcode}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="table-cell">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                        {product.category || 'Uncategorized'}
                      </span>
                    </td>
                    <td className="table-cell">
                      <div>
                        <div className="font-medium">
                          {formatCurrency(product.price)}
                        </div>
                        {product.cost > 0 && (
                          <div className="text-sm text-gray-500">
                            Cost: {formatCurrency(product.cost)}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="text-sm">
                        <div className="font-medium">{product.stock}</div>
                        <div className="text-gray-500">
                          Min: {product.min_stock}
                        </div>
                      </div>
                    </td>
                    <td className="table-cell">
                      <span className={cn(
                        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                        stockStatus.color
                      )}>
                        {stockStatus.status === 'out' && (
                          <>
                            <AlertTriangle size={12} className="mr-1 rtl:mr-0 rtl:ml-1" />
                            Out of Stock
                          </>
                        )}
                        {stockStatus.status === 'low' && (
                          <>
                            <AlertTriangle size={12} className="mr-1 rtl:mr-0 rtl:ml-1" />
                            Low Stock
                          </>
                        )}
                        {stockStatus.status === 'good' && 'In Stock'}
                      </span>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <button
                          onClick={() => handleEditProduct(product)}
                          className="p-1 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product)}
                          className="p-1 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <Package size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No products found
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {searchTerm || selectedCategory 
                  ? 'Try adjusting your search or filter criteria'
                  : 'Get started by adding your first product'
                }
              </p>
              {!searchTerm && !selectedCategory && (
                <button
                  onClick={handleAddProduct}
                  className="btn-primary"
                >
                  {t('products.addProduct')}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Product Modal */}
      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        product={editingProduct}
      />
    </div>
  );
};

export default Products;
