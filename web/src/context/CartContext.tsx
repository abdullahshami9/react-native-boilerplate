'use client';

import React, { createContext, useState, useEffect, ReactNode } from 'react';

export const CartContext = createContext<any>(null);

export const CartProvider = ({ children }: { children: ReactNode }) => {
    const [cartItems, setCartItems] = useState<any[]>([]);

    useEffect(() => {
        // Only run on client side
        const savedCart = localStorage.getItem('cartItems');
        if (savedCart) {
            setCartItems(JSON.parse(savedCart));
        }
    }, []);

    const saveCartToStorage = (items: any[]) => {
        localStorage.setItem('cartItems', JSON.stringify(items));
    };

    const addToCart = (product: any) => {
        setCartItems(prev => {
            let newItems;
            const existing = prev.find((p: any) => p.id === product.id);
            if (existing) {
                newItems = prev.map((p: any) => p.id === product.id ? { ...p, quantity: p.quantity + 1 } : p);
            } else {
                newItems = [...prev, { ...product, quantity: 1 }];
            }
            saveCartToStorage(newItems);
            return newItems;
        });
    };

    const removeFromCart = (productId: number) => {
        setCartItems(prev => {
            const newItems = prev.filter((p: any) => p.id !== productId);
            saveCartToStorage(newItems);
            return newItems;
        });
    };

    const clearCart = () => {
        setCartItems([]);
        localStorage.removeItem('cartItems');
    };

    return (
        <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, clearCart }}>
            {children}
        </CartContext.Provider>
    );
};
