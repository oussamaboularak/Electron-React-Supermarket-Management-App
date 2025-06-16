import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Search, Package, AlertTriangle } from 'lucide-react';

import useProductStore from '../../store/useProductStore';
import { formatCurrency, cn } from '../../utils/helpers';

const ProductSelector = ({ isOpen, onClose, onSelectProduct }) => {
  const { t } = useTranslation();
  const { products, categories } = useProductStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // Filter products based on search and category
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = !searchTerm || 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.name_ar && product.name_ar.includes(searchTerm)) ||
        (product.barcode && product.barcode.includes(searchTerm));
      
      const matchesCategory = !selectedCategory || product.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, selectedCategory]);

  const handleProductClick = (product) => {
    onSelectProduct(product);
  };

  const getStockStatus = (product) => {
    if (product.stock === 0) {
      return { status: 'out', color: 'text-red-600 bg-red-100 dark:bg-red-900/20' };
    } else if (product.stock <= product.min_stock) {
      return { status: 'low', color: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20' };
    }
    return { status: 'good', color: 'text-green-600 bg-green-100 dark:bg-green-900/20' };
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="inline-block w-full max-w-4xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-gray-800 shadow-xl rounded-lg">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t('sales.selectProduct')}
            </h3>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <X size={20} />
            </button>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
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
                  autoFocus
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

          {/* Products Grid */}
          <div className="max-h-96 overflow-y-auto">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <Package size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No products found
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Try adjusting your search or filter criteria
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredProducts.map((product) => {
                  const stockStatus = getStockStatus(product);
                  const isOutOfStock = product.stock === 0;
                  
                  return (
                    <div
                      key={product.id}
                      onClick={() => !isOutOfStock && handleProductClick(product)}
                      className={cn(
                        "p-4 border border-gray-200 dark:border-gray-600 rounded-lg transition-all cursor-pointer",
                        isOutOfStock 
                          ? "opacity-50 cursor-not-allowed bg-gray-50 dark:bg-gray-700/50"
                          : "hover:border-primary-500 hover:shadow-md bg-white dark:bg-gray-700"
                      )}
                    >
                      {/* Product Info */}
                      <div className="mb-3">
                        <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                          {product.name}
                        </h4>
                        {product.name_ar && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                            {product.name_ar}
                          </p>
                        )}
                        {product.barcode && (
                          <p className="text-xs text-gray-400">
                            {product.barcode}
                          </p>
                        )}
                      </div>

                      {/* Category */}
                      {product.category && (
                        <div className="mb-2">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-300">
                            {product.category}
                          </span>
                        </div>
                      )}

                      {/* Price */}
                      <div className="mb-3">
                        <p className="text-lg font-bold text-gray-900 dark:text-white">
                          {formatCurrency(product.price)}
                        </p>
                        {product.cost > 0 && (
                          <p className="text-sm text-gray-500">
                            Cost: {formatCurrency(product.cost)}
                          </p>
                        )}
                      </div>

                      {/* Stock Status */}
                      <div className="flex items-center justify-between">
                        <div className="text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Stock: </span>
                          <span className="font-medium">{product.stock}</span>
                        </div>
                        
                        <span className={cn(
                          "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
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
                      </div>

                      {/* Add to Cart Indicator */}
                      {!isOutOfStock && (
                        <div className="mt-3 text-center">
                          <span className="text-sm text-primary-600 dark:text-primary-400 font-medium">
                            Click to add to cart
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {filteredProducts.length} products available
              </p>
              <button
                onClick={onClose}
                className="btn-secondary"
              >
                {t('common.cancel')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductSelector;
