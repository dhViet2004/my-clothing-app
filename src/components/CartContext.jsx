import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    const loadCart = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            if (!token) {
                // Load from localStorage for guest users
                const savedCart = localStorage.getItem('guestCart');
                if (savedCart) {
                    setCartItems(JSON.parse(savedCart));
                }
                return;
            }

            const response = await axios.get('http://localhost:8080/cart', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.data.success) {
                setCartItems(response.data.items);
            }
        } catch (error) {
            console.error('Error loading cart:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCart();
    }, [user]);

    const saveCartToServer = async (items) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                // Save to localStorage for guest users
                localStorage.setItem('guestCart', JSON.stringify(items));
                return;
            }

            await axios.post('http://localhost:8080/cart', {
                items: items.map(item => ({
                    product_id: item.product_id,
                    quantity: item.quantity
                }))
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
        } catch (error) {
            console.error('Error saving cart to server:', error);
        }
    };

    const addToCart = async (product, quantity = 1) => {
        try {
            const existingItem = cartItems.find(item => item.product_id === product.product_id);
            let newItems;

            if (existingItem) {
                newItems = cartItems.map(item =>
                    item.product_id === product.product_id
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            } else {
                newItems = [...cartItems, { ...product, quantity }];
            }

            setCartItems(newItems);
            await saveCartToServer(newItems);
        } catch (error) {
            console.error('Error adding to cart:', error);
        }
    };

    const removeFromCart = async (productId) => {
        try {
            const newItems = cartItems.filter(item => item.product_id !== productId);
            setCartItems(newItems);
            await saveCartToServer(newItems);
        } catch (error) {
            console.error('Error removing from cart:', error);
        }
    };

    const updateQuantity = async (productId, quantity) => {
        try {
            if (quantity < 1) return;

            const newItems = cartItems.map(item =>
                item.product_id === productId
                    ? { ...item, quantity }
                    : item
            );

            setCartItems(newItems);
            await saveCartToServer(newItems);
        } catch (error) {
            console.error('Error updating quantity:', error);
        }
    };

    const clearCart = async () => {
        try {
            setCartItems([]);
            const token = localStorage.getItem('token');
            if (token) {
                await axios.delete('http://localhost:8080/cart/clear', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
            } else {
                localStorage.removeItem('guestCart');
            }
        } catch (error) {
            console.error('Error clearing cart:', error);
        }
    };

    const getCartTotal = () => {
        return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    const getCartItemCount = () => {
        return cartItems.reduce((total, item) => total + item.quantity, 0);
    };

    const transferGuestCartToDB = async () => {
        try {
            const guestCart = localStorage.getItem('guestCart');
            if (guestCart) {
                const items = JSON.parse(guestCart);
                await saveCartToServer(items);
                localStorage.removeItem('guestCart');
            }
        } catch (error) {
            console.error('Error transferring guest cart to DB:', error);
        }
    };

    const value = {
        cartItems,
        loading,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartItemCount,
        transferGuestCartToDB
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
}; 