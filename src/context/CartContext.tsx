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

    const addToCart = (product: any, variant: any = null) => {
        setCartItems(prev => {
            let newItems;
            // Check for existing item with same ID and same Variant
            const existingIndex = prev.findIndex(p =>
                p.id === product.id &&
                JSON.stringify(p.variant) === JSON.stringify(variant)
            );

            if (existingIndex >= 0) {
                newItems = [...prev];
                newItems[existingIndex].quantity += 1;
            } else {
                newItems = [...prev, {
                    ...product,
                    variant,
                    quantity: 1,
                    cartItemId: Date.now().toString() + Math.random().toString()
                }];
            }
            saveCart(newItems);
            return newItems;
        });
    };

    const removeFromCart = (cartItemId: string) => {
        setCartItems(prev => {
            const newItems = prev.filter(p => p.cartItemId !== cartItemId);
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
