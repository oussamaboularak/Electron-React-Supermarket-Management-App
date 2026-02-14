import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Sale } from '../types';

interface SalesState {
    sales: Sale[];
    addSale: (sale: Sale) => void;
}

export const useSalesStore = create<SalesState>()(
    persist(
        (set) => ({
            sales: [],
            addSale: (sale) => set((state) => ({ sales: [sale, ...state.sales] })),
        }),
        {
            name: 'sales-storage',
        }
    )
);
