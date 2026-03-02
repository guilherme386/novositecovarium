import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '@/lib/products';

interface CartItem extends Product {
    quantity: number;
    mcNick?: string;
    dcNick?: string;
    clanTag?: string;
    tip?: number;
    message?: string;
}

interface CartContextType {
    items: CartItem[];
    addItem: (item: CartItem) => void;
    removeItem: (id: string) => void;
    updateQuantity: (id: string, quantity: number) => void;
    clearCart: () => void;
    total: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [items, setItems] = useState<CartItem[]>([]);

    useEffect(() => {
        const savedCart = localStorage.getItem('covarium_cart');
        if (savedCart) {
            try {
                setItems(JSON.parse(savedCart));
            } catch (e) {
                console.error("Failed to parse cart", e);
            }
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('covarium_cart', JSON.stringify(items));
    }, [items]);

    const addItem = (item: CartItem) => {
        setItems((prev) => {
            const existing = prev.find((i) => i.id === item.id && i.mcNick === item.mcNick);
            if (existing) {
                return prev.map((i) =>
                    i.id === item.id && i.mcNick === item.mcNick
                        ? { ...i, quantity: i.quantity + 1 }
                        : i
                );
            }
            return [...prev, item];
        });
    };

    const removeItem = (id: string) => {
        setItems((prev) => prev.filter((i) => i.id !== id));
    };

    const updateQuantity = (id: string, quantity: number) => {
        setItems((prev) =>
            prev.map((i) => (i.id === id ? { ...i, quantity: Math.max(1, quantity) } : i))
        );
    };

    const clearCart = () => {
        setItems([]);
    };

    const total = items.reduce((acc, item) => acc + (item.price + (item.tip || 0)) * item.quantity, 0);

    return (
        <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, total }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
