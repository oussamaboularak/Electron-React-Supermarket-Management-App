import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Plus, 
  Minus, 
  Trash2, 
  ShoppingCart,
  CreditCard,
  DollarSign,
  Receipt,
  Search,
  User,
  Phone
} from 'lucide-react';
import toast from 'react-hot-toast';

import useProductStore from '../store/useProductStore';
import useSalesStore from '../store/useSalesStore';
import useAppStore from '../store/useAppStore';
import ProductSelector from '../components/Sales/ProductSelector';
import { formatCurrency, formatNumber, generateInvoiceNumber } from '../utils/helpers';

const Sales = () => {
  const { t } = useTranslation();
  const { settings } = useAppStore();
  const { products } = useProductStore();
  const {
    currentSale,
    addItemToSale,
    removeItemFromSale,
    updateItemQuantity,
    updateCustomer,
    setPaymentMethod,
    setDiscount,
    setTax,
    calculateTotals,
    completeSale,
    clearSale
  } = useSalesStore();

  const [showProductSelector, setShowProductSelector] = useState(false);
  const [barcodeInput, setBarcodeInput] = useState('');
  const [processing, setProcessing] = useState(false);

  const totals = calculateTotals();

  // Handle barcode scan/input
  const handleBarcodeSubmit = (e) => {
    e.preventDefault();
    if (!barcodeInput.trim()) return;

    const product = products.find(p => p.barcode === barcodeInput.trim());
    if (product) {
      if (product.stock > 0) {
        addItemToSale(product);
        setBarcodeInput('');
        toast.success(`${product.name} added to cart`);
      } else {
        toast.error(t('products.outOfStock'));
      }
    } else {
      toast.error(t('products.productNotFound'));
    }
  };

  const handleProductSelect = (product) => {
    if (product.stock > 0) {
      addItemToSale(product);
      setShowProductSelector(false);
      toast.success(`${product.name} added to cart`);
    } else {
      toast.error(t('products.outOfStock'));
    }
  };

  const handleQuantityChange = (productId, newQuantity) => {
    const product = products.find(p => p.id === productId);
    if (product && newQuantity > product.stock) {
      toast.error(t('errors.insufficientStock'));
      return;
    }
    updateItemQuantity(productId, newQuantity);
  };

  const handleCompleteSale = async () => {
    if (currentSale.items.length === 0) {
      toast.error('No items in cart');
      return;
    }

    // Check stock availability
    for (const item of currentSale.items) {
      const product = products.find(p => p.id === item.product.id);
      if (!product || product.stock < item.quantity) {
        toast.error(`Insufficient stock for ${item.product.name}`);
        return;
      }
    }

    setProcessing(true);
    try {
      const result = await completeSale();
      if (result.success) {
        toast.success(t('sales.saleCompleted'));
        // Optionally print invoice
        if (window.confirm('Print invoice?')) {
          printInvoice(result.invoiceNumber, result.saleId);
        }
      } else {
        toast.error(result.error || t('errors.generalError'));
      }
    } catch (error) {
      console.error('Error completing sale:', error);
      toast.error(t('errors.generalError'));
    } finally {
      setProcessing(false);
    }
  };

  const printInvoice = (invoiceNumber, saleId) => {
    // Create a simple invoice print layout
    const printWindow = window.open('', '_blank');
    const invoiceHTML = `
      <html>
        <head>
          <title>Invoice ${invoiceNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 20px; }
            .invoice-details { margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .total { font-weight: bold; }
            .footer { margin-top: 20px; text-align: center; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>${settings.storeName || 'Market Manager'}</h2>
            <p>${settings.storeAddress || ''}</p>
            <p>${settings.storePhone || ''}</p>
          </div>
          
          <div class="invoice-details">
            <p><strong>Invoice #:</strong> ${invoiceNumber}</p>
            <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
            <p><strong>Customer:</strong> ${currentSale.customer.name || 'Walk-in Customer'}</p>
            ${currentSale.customer.phone ? `<p><strong>Phone:</strong> ${currentSale.customer.phone}</p>` : ''}
          </div>

          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${currentSale.items.map(item => `
                <tr>
                  <td>${item.product.name}</td>
                  <td>${item.quantity}</td>
                  <td>${formatCurrency(item.unitPrice)}</td>
                  <td>${formatCurrency(item.total)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div style="margin-top: 20px;">
            <p><strong>Subtotal:</strong> ${formatCurrency(totals.subtotal)}</p>
            ${totals.discountAmount > 0 ? `<p><strong>Discount:</strong> -${formatCurrency(totals.discountAmount)}</p>` : ''}
            ${totals.taxAmount > 0 ? `<p><strong>Tax:</strong> ${formatCurrency(totals.taxAmount)}</p>` : ''}
            <p class="total"><strong>Total:</strong> ${formatCurrency(totals.grandTotal)}</p>
            <p><strong>Payment Method:</strong> ${currentSale.paymentMethod.toUpperCase()}</p>
          </div>

          <div class="footer">
            <p>Thank you for your business!</p>
          </div>
        </body>
      </html>
    `;
    
    printWindow.document.write(invoiceHTML);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
      {/* Left Panel - Product Selection */}
      <div className="lg:col-span-2 space-y-6">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            {t('sales.newSale')}
          </h1>
          
          {/* Barcode Scanner */}
          <form onSubmit={handleBarcodeSubmit} className="flex gap-3">
            <div className="flex-1">
              <input
                type="text"
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                placeholder="Scan or enter barcode"
                className="form-input"
                autoFocus
              />
            </div>
            <button
              type="button"
              onClick={() => setShowProductSelector(true)}
              className="btn-primary flex items-center space-x-2 rtl:space-x-reverse"
            >
              <Search size={16} />
              <span>Browse</span>
            </button>
          </form>
        </div>

        {/* Cart Items */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Cart ({currentSale.items.length} items)
            </h3>
          </div>
          
          <div className="p-4">
            {currentSale.items.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingCart size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  Cart is empty. Add products to start a sale.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {currentSale.items.map((item) => (
                  <div key={item.product.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {item.product.name}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {formatCurrency(item.unitPrice)} each
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-3 rtl:space-x-reverse">
                      <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <button
                          onClick={() => handleQuantityChange(item.product.id, item.quantity - 1)}
                          className="p-1 text-gray-600 dark:text-gray-400 hover:text-red-600"
                        >
                          <Minus size={16} />
                        </button>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleQuantityChange(item.product.id, parseInt(e.target.value) || 0)}
                          className="w-16 text-center form-input py-1"
                          min="0"
                        />
                        <button
                          onClick={() => handleQuantityChange(item.product.id, item.quantity + 1)}
                          className="p-1 text-gray-600 dark:text-gray-400 hover:text-green-600"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                      
                      <div className="text-right rtl:text-left min-w-[80px]">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {formatCurrency(item.total)}
                        </p>
                      </div>
                      
                      <button
                        onClick={() => removeItemFromSale(item.product.id)}
                        className="p-1 text-gray-600 dark:text-gray-400 hover:text-red-600"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Panel - Sale Summary */}
      <div className="space-y-6">
        {/* Customer Info */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Customer Information
          </h3>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <User size={16} className="inline mr-1 rtl:mr-0 rtl:ml-1" />
                {t('sales.customerName')}
              </label>
              <input
                type="text"
                value={currentSale.customer.name}
                onChange={(e) => updateCustomer({ name: e.target.value })}
                className="form-input"
                placeholder="Optional"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <Phone size={16} className="inline mr-1 rtl:mr-0 rtl:ml-1" />
                {t('sales.customerPhone')}
              </label>
              <input
                type="tel"
                value={currentSale.customer.phone}
                onChange={(e) => updateCustomer({ phone: e.target.value })}
                className="form-input"
                placeholder="Optional"
              />
            </div>
          </div>
        </div>

        {/* Payment Method */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {t('sales.paymentMethod')}
          </h3>
          
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setPaymentMethod('cash')}
              className={`p-3 rounded-lg border-2 transition-colors ${
                currentSale.paymentMethod === 'cash'
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-gray-200 dark:border-gray-600'
              }`}
            >
              <DollarSign size={20} className="mx-auto mb-1" />
              <span className="text-sm font-medium">{t('sales.cash')}</span>
            </button>
            
            <button
              onClick={() => setPaymentMethod('card')}
              className={`p-3 rounded-lg border-2 transition-colors ${
                currentSale.paymentMethod === 'card'
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-gray-200 dark:border-gray-600'
              }`}
            >
              <CreditCard size={20} className="mx-auto mb-1" />
              <span className="text-sm font-medium">{t('sales.card')}</span>
            </button>
          </div>
        </div>

        {/* Discount & Tax */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('sales.discount')} (%)
              </label>
              <input
                type="number"
                value={currentSale.discount}
                onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                className="form-input"
                min="0"
                max="100"
                step="0.1"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('sales.tax')} (%)
              </label>
              <input
                type="number"
                value={currentSale.tax}
                onChange={(e) => setTax(parseFloat(e.target.value) || 0)}
                className="form-input"
                min="0"
                step="0.1"
              />
            </div>
          </div>
        </div>

        {/* Sale Summary */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Sale Summary
          </h3>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">{t('sales.subtotal')}:</span>
              <span className="font-medium">{formatCurrency(totals.subtotal)}</span>
            </div>
            
            {totals.discountAmount > 0 && (
              <div className="flex justify-between text-red-600">
                <span>{t('sales.discount')}:</span>
                <span>-{formatCurrency(totals.discountAmount)}</span>
              </div>
            )}
            
            {totals.taxAmount > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">{t('sales.tax')}:</span>
                <span className="font-medium">{formatCurrency(totals.taxAmount)}</span>
              </div>
            )}
            
            <div className="border-t border-gray-200 dark:border-gray-700 pt-2">
              <div className="flex justify-between text-lg font-bold">
                <span>{t('sales.grandTotal')}:</span>
                <span>{formatCurrency(totals.grandTotal)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={handleCompleteSale}
            disabled={currentSale.items.length === 0 || processing}
            className="w-full btn-primary flex items-center justify-center space-x-2 rtl:space-x-reverse py-3"
          >
            {processing ? (
              <div className="spinner" />
            ) : (
              <Receipt size={20} />
            )}
            <span>
              {processing ? t('common.loading') : t('sales.completeSale')}
            </span>
          </button>
          
          <button
            onClick={clearSale}
            disabled={currentSale.items.length === 0}
            className="w-full btn-secondary py-3"
          >
            Clear Cart
          </button>
        </div>
      </div>

      {/* Product Selector Modal */}
      <ProductSelector
        isOpen={showProductSelector}
        onClose={() => setShowProductSelector(false)}
        onSelectProduct={handleProductSelect}
      />
    </div>
  );
};

export default Sales;
