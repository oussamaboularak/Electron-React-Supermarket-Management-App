import { create } from 'zustand';
import type { CartItem, Product } from '../types';

interface CartState {
    items: CartItem[];
    addToCart: (product: Product) => void;
    removeFromCart: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    clearCart: () => void;
    total: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
    items: [],
    addToCart: (product) => {
        const items = get().items;
        const existingItem = items.find((item) => item.id === product.id);

        if (existingItem) {
            set({
                items: items.map((item) =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                ),
            });
        } else {
            set({ items: [...items, { ...product, quantity: 1 }] });
        }
    },
    removeFromCart: (productId) =>
        set((state) => ({
            items: state.items.filter((item) => item.id !== productId),
        })),
    updateQuantity: (productId, quantity) =>
        set((state) => ({
            items: state.items.map((item) =>
                item.id === productId ? { ...item, quantity: Math.max(0, quantity) } : item
            ).filter(item => item.quantity > 0),
        })),
    clearCart: () => set({ items: [] }),
    total: () => get().items.reduce((sum, item) => sum + item.price * item.quantity, 0),
}));
