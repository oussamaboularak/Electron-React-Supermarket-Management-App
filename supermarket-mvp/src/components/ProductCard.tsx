import React from 'react';
import type { Product } from '../types';
import { Package } from 'lucide-react';

interface ProductCardProps {
    product: Product;
    onClick: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onClick }) => {
    return (
        <div
            onClick={() => product.stock > 0 && onClick(product)}
            className={`bg-white p-4 rounded-xl shadow-sm border border-slate-100 cursor-pointer transition-all duration-200 group ${product.stock > 0 ? 'hover:shadow-md hover:border-emerald-200 active:scale-95' : 'opacity-50 cursor-not-allowed'
                }`}
        >
            <div className="aspect-square bg-slate-50 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                {product.image ? (
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                    <Package size={32} className="text-slate-300 group-hover:text-emerald-400 transition-colors" />
                )}
            </div>
            <h3 className="font-medium text-slate-900 truncate">{product.name}</h3>
            <div className="flex items-center justify-between mt-1">
                <p className="font-bold text-emerald-600">${product.price.toFixed(2)}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full ${product.stock > 0 ? 'bg-slate-100 text-slate-600' : 'bg-red-100 text-red-600'}`}>
                    {product.stock} left
                </span>
            </div>
        </div>
    );
};

export default ProductCard;
