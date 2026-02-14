import React, { useState } from 'react';
import { useProductStore } from '../store/useProductStore';
import { useCartStore } from '../store/useCartStore';
import { useSalesStore } from '../store/useSalesStore';
import ProductCard from '../components/ProductCard';
import { Search, ShoppingCart, Trash2, Plus, Minus, CreditCard, Banknote } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import toast, { Toaster } from 'react-hot-toast';

const POS: React.FC = () => {
    const { products, updateProduct } = useProductStore();
    const { items, addToCart, removeFromCart, updateQuantity, clearCart, total } = useCartStore();
    const { addSale } = useSalesStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('All');

    const categories = ['All', ...Array.from(new Set(products.map((p) => p.category)))];

    const filteredProducts = products.filter((product) =>
        (selectedCategory === 'All' || product.category === selectedCategory) &&
        (product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.barcode.includes(searchTerm))
    );

    const handleCheckout = (paymentMethod: 'cash' | 'card') => {
        if (items.length === 0) return;

        const sale = {
            id: uuidv4(),
            items: [...items],
            total: total(),
            date: new Date().toISOString(),
            paymentMethod,
        };

        // Update stock
        items.forEach((item) => {
            const product = products.find((p) => p.id === item.id);
            if (product) {
                updateProduct(product.id, { stock: product.stock - item.quantity });
            }
        });

        addSale(sale);
        clearCart();
        toast.success('Sale completed successfully!');
    };

    return (
        <div className="flex h-[calc(100vh-theme(spacing.32))] gap-6">
            <Toaster position="bottom-right" />

            {/* Product Section */}
            <div className="flex-1 flex flex-col gap-6">
                <div className="flex gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm"
                        />
                    </div>
                </div>

                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {categories.map((category) => (
                        <button
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                            className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all ${selectedCategory === category
                                    ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20'
                                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                                }`}
                        >
                            {category}
                        </button>
                    ))}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 overflow-y-auto pr-2 pb-20">
                    {filteredProducts.map((product) => (
                        <ProductCard key={product.id} product={product} onClick={addToCart} />
                    ))}
                </div>
            </div>

            {/* Cart Section */}
            <div className="w-96 bg-white rounded-2xl shadow-xl shadow-slate-200/50 flex flex-col border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                    <div className="flex items-center gap-3 text-slate-800">
                        <ShoppingCart className="text-emerald-500" />
                        <h2 className="font-bold text-lg">Current Order</h2>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {items.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-3">
                            <ShoppingCart size={48} className="text-slate-200" />
                            <p>Cart is empty</p>
                        </div>
                    ) : (
                        items.map((item) => (
                            <div key={item.id} className="flex gap-4 p-3 bg-slate-50 rounded-xl border border-slate-100 group hover:border-emerald-200 transition-colors">
                                <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center overflow-hidden shrink-0">
                                    {item.image ? (
                                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <ShoppingCart size={20} className="text-slate-300" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-medium text-slate-900 truncate">{item.name}</h4>
                                    <p className="text-emerald-600 font-bold">${(item.price * item.quantity).toFixed(2)}</p>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <button onClick={() => removeFromCart(item.id)} className="text-slate-400 hover:text-red-500 transition-colors">
                                        <Trash2 size={16} />
                                    </button>
                                    <div className="flex items-center gap-2 bg-white rounded-lg border border-slate-200 shadow-sm">
                                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1 hover:bg-slate-50 text-slate-600 rounded-l-lg">
                                            <Minus size={14} />
                                        </button>
                                        <span className="text-sm font-medium w-4 text-center">{item.quantity}</span>
                                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1 hover:bg-slate-50 text-slate-600 rounded-r-lg">
                                            <Plus size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="p-6 bg-slate-50/80 border-t border-slate-100 backdrop-blur-sm">
                    <div className="space-y-2 mb-6">
                        <div className="flex justify-between text-slate-500">
                            <span>Subtotal</span>
                            <span>${total().toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-slate-500">
                            <span>Tax (10%)</span>
                            <span>${(total() * 0.1).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-2xl font-bold text-slate-900 pt-4 border-t border-slate-200">
                            <span>Total</span>
                            <span>${(total() * 1.1).toFixed(2)}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={() => handleCheckout('cash')}
                            disabled={items.length === 0}
                            className="flex flex-col items-center justify-center gap-2 py-4 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/30 transition-all active:scale-95"
                        >
                            <Banknote />
                            <span className="font-bold">Cash</span>
                        </button>
                        <button
                            onClick={() => handleCheckout('card')}
                            disabled={items.length === 0}
                            className="flex flex-col items-center justify-center gap-2 py-4 bg-slate-900 text-white rounded-xl hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-slate-900/30 transition-all active:scale-95"
                        >
                            <CreditCard />
                            <span className="font-bold">Card</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default POS;
