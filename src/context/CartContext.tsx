import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const CartContext = createContext<any>(null);

export const CartProvider = ({ children }: any) => {
    const [cartItems, setCartItems] = useState<any[]>([]);

    useEffect(() => {
        loadCart();
    }, []);

    const loadCart = async () => {
        try {
            const savedCart = await AsyncStorage.getItem('cartItems');
            if (savedCart) {
                setCartItems(JSON.parse(savedCart));
            }
        } catch (error) {
            console.error("Failed to load cart from storage", error);
        }
    };

    const saveCart = async (items: any[]) => {
        try {
            await AsyncStorage.setItem('cartItems', JSON.stringify(items));
        } catch (error) {
            console.error("Failed to save cart to storage", error);
        }
    };

    const addToCart = (product: any) => {
        setCartItems(prev => {
            let newItems;
            const existing = prev.find(p => p.id === product.id);
            if (existing) {
                newItems = prev.map(p => p.id === product.id ? { ...p, quantity: p.quantity + 1 } : p);
            } else {
                newItems = [...prev, { ...product, quantity: 1 }];
            }
            saveCart(newItems);
            return newItems;
        });
    };

    const removeFromCart = (productId: number) => {
        setCartItems(prev => {
            const newItems = prev.filter(p => p.id !== productId);
            saveCart(newItems);
            return newItems;
        });
    };

    const clearCart = () => {
        setCartItems([]);
        saveCart([]);
    };

    return (
        <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, clearCart }}>
            {children}
        </CartContext.Provider>
    );
};
