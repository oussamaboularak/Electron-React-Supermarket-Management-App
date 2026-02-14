import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface ProductState {
    products: Product[];
    addProduct: (product: Omit<Product, 'id'>) => void;
    updateProduct: (id: string, product: Partial<Product>) => void;
    deleteProduct: (id: string) => void;
    getProduct: (id: string) => Product | undefined;
}

export const useProductStore = create<ProductState>()(
    persist(
        (set, get) => ({
            products: [],
            addProduct: (product) =>
                set((state) => ({
                    products: [...state.products, { ...product, id: uuidv4() }],
                })),
            updateProduct: (id, updatedProduct) =>
                set((state) => ({
                    products: state.products.map((p) =>
                        p.id === id ? { ...p, ...updatedProduct } : p
                    ),
                })),
            deleteProduct: (id) =>
                set((state) => ({
                    products: state.products.filter((p) => p.id !== id),
                })),
            getProduct: (id) => get().products.find((p) => p.id === id),
        }),
        {
            name: 'product-storage',
        }
    )
);
