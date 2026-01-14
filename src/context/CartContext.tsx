import React, { createContext, useState, useContext } from 'react';

export const CartContext = createContext<any>(null);

export const CartProvider = ({ children }: any) => {
    const [cartItems, setCartItems] = useState<any[]>([]);

    const addToCart = (product: any) => {
        setCartItems(prev => {
            const existing = prev.find(p => p.id === product.id);
            if (existing) {
                return prev.map(p => p.id === product.id ? { ...p, quantity: p.quantity + 1 } : p);
            }
            return [...prev, { ...product, quantity: 1 }];
        });
    };

    const removeFromCart = (productId: number) => {
        setCartItems(prev => prev.filter(p => p.id !== productId));
    };

    const clearCart = () => {
        setCartItems([]);
    };

    return (
        <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, clearCart }}>
            {children}
        </CartContext.Provider>
    );
};
