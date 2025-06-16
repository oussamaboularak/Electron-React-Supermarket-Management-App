import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Save, Package } from 'lucide-react';
import toast from 'react-hot-toast';

import useProductStore from '../../store/useProductStore';
import { toNumber } from '../../utils/helpers';

const ProductModal = ({ isOpen, onClose, product }) => {
  const { t } = useTranslation();
  const { addProduct, updateProduct, categories } = useProductStore();
  
  const [formData, setFormData] = useState({
    name: '',
    name_ar: '',
    barcode: '',
    category: '',
    price: '',
    cost: '',
    stock: '',
    min_stock: '5',
    description: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Reset form when modal opens/closes or product changes
  useEffect(() => {
    if (isOpen) {
      if (product) {
        setFormData({
          name: product.name || '',
          name_ar: product.name_ar || '',
          barcode: product.barcode || '',
          category: product.category || '',
          price: product.price?.toString() || '',
          cost: product.cost?.toString() || '',
          stock: product.stock?.toString() || '',
          min_stock: product.min_stock?.toString() || '5',
          description: product.description || ''
        });
      } else {
        setFormData({
          name: '',
          name_ar: '',
          barcode: '',
          category: '',
          price: '',
          cost: '',
          stock: '',
          min_stock: '5',
          description: ''
        });
      }
      setErrors({});
    }
  }, [isOpen, product]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = t('errors.required');
    }

    if (!formData.price || toNumber(formData.price) <= 0) {
      newErrors.price = t('errors.invalidPrice');
    }

    if (formData.cost && toNumber(formData.cost) < 0) {
      newErrors.cost = t('errors.invalidPrice');
    }

    if (formData.stock && toNumber(formData.stock) < 0) {
      newErrors.stock = t('errors.invalidQuantity');
    }

    if (formData.min_stock && toNumber(formData.min_stock) < 0) {
      newErrors.min_stock = t('errors.invalidQuantity');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      const productData = {
        name: formData.name.trim(),
        name_ar: formData.name_ar.trim(),
        barcode: formData.barcode.trim(),
        category: formData.category.trim(),
        price: toNumber(formData.price),
        cost: toNumber(formData.cost),
        stock: toNumber(formData.stock),
        min_stock: toNumber(formData.min_stock, 5),
        description: formData.description.trim()
      };

      let result;
      if (product) {
        result = await updateProduct(product.id, productData);
        if (result.success) {
          toast.success(t('products.productUpdated'));
        }
      } else {
        result = await addProduct(productData);
        if (result.success) {
          toast.success(t('products.productAdded'));
        }
      }

      if (result.success) {
        onClose();
      } else {
        toast.error(result.error || t('errors.generalError'));
      }
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error(t('errors.generalError'));
    } finally {
      setLoading(false);
    }
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
        <div className="inline-block w-full max-w-2xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-gray-800 shadow-xl rounded-lg">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <div className="p-2 bg-primary-100 dark:bg-primary-900 rounded-lg">
                <Package size={20} className="text-primary-600 dark:text-primary-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {product ? t('products.editProduct') : t('products.addProduct')}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <X size={20} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Product Names */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('products.productName')} *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`form-input ${errors.name ? 'border-red-500' : ''}`}
                  placeholder="Enter product name"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('products.productNameAr')}
                </label>
                <input
                  type="text"
                  name="name_ar"
                  value={formData.name_ar}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="أدخل اسم المنتج بالعربية"
                  dir="rtl"
                />
              </div>
            </div>

            {/* Barcode and Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('products.productBarcode')}
                </label>
                <input
                  type="text"
                  name="barcode"
                  value={formData.barcode}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter barcode"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('products.productCategory')}
                </label>
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter category"
                  list="categories"
                />
                <datalist id="categories">
                  {categories.map(category => (
                    <option key={category} value={category} />
                  ))}
                </datalist>
              </div>
            </div>

            {/* Price and Cost */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('products.productPrice')} *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  className={`form-input ${errors.price ? 'border-red-500' : ''}`}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                />
                {errors.price && (
                  <p className="mt-1 text-sm text-red-600">{errors.price}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('products.productCost')}
                </label>
                <input
                  type="number"
                  name="cost"
                  value={formData.cost}
                  onChange={handleInputChange}
                  className={`form-input ${errors.cost ? 'border-red-500' : ''}`}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                />
                {errors.cost && (
                  <p className="mt-1 text-sm text-red-600">{errors.cost}</p>
                )}
              </div>
            </div>

            {/* Stock */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('products.productStock')}
                </label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleInputChange}
                  className={`form-input ${errors.stock ? 'border-red-500' : ''}`}
                  placeholder="0"
                  min="0"
                />
                {errors.stock && (
                  <p className="mt-1 text-sm text-red-600">{errors.stock}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('products.minStock')}
                </label>
                <input
                  type="number"
                  name="min_stock"
                  value={formData.min_stock}
                  onChange={handleInputChange}
                  className={`form-input ${errors.min_stock ? 'border-red-500' : ''}`}
                  placeholder="5"
                  min="0"
                />
                {errors.min_stock && (
                  <p className="mt-1 text-sm text-red-600">{errors.min_stock}</p>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('products.productDescription')}
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="form-input"
                placeholder="Enter product description"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-3 rtl:space-x-reverse pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary"
                disabled={loading}
              >
                {t('common.cancel')}
              </button>
              <button
                type="submit"
                className="btn-primary flex items-center space-x-2 rtl:space-x-reverse"
                disabled={loading}
              >
                {loading ? (
                  <div className="spinner" />
                ) : (
                  <Save size={16} />
                )}
                <span>{loading ? t('common.loading') : t('common.save')}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
