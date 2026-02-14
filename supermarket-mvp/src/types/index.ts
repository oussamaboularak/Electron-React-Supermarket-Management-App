export interface Product {
    id: string;
    name: string;
    barcode: string;
    category: string;
    price: number;
    cost: number;
    stock: number;
    image?: string;
}

export interface CartItem extends Product {
    quantity: number;
}

export interface Sale {
    id: string;
    items: CartItem[];
    total: number;
    date: string;
    paymentMethod: 'cash' | 'card';
}
