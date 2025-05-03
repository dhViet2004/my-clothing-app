import React, { createContext, useContext, useState, useEffect } from 'react';
import { message } from 'antd';
import axios from 'axios';

const FavoriteContext = createContext(null);

export const useFavorite = () => {
    const context = useContext(FavoriteContext);
    if (!context) {
        throw new Error('useFavorite must be used within a FavoriteProvider');
    }
    return context;
};

export const FavoriteProvider = ({ children }) => {
    const [favorites, setFavorites] = useState(() => {
        const savedFavorites = localStorage.getItem('favorites');
        return savedFavorites ? JSON.parse(savedFavorites) : [];
    });

    useEffect(() => {
        localStorage.setItem('favorites', JSON.stringify(favorites));
    }, [favorites]);

    const addToFavorites = async (product) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                message.warning('Vui lòng đăng nhập để thêm vào yêu thích');
                return;
            }

            // Check if product is already in favorites
            if (favorites.some(fav => fav.product_id === product.product_id)) {
                message.info('Sản phẩm đã có trong danh sách yêu thích');
                return;
            }

            // Add to favorites
            setFavorites(prev => [...prev, product]);
            message.success('Đã thêm vào yêu thích');
        } catch (error) {
            console.error('Error adding to favorites:', error);
            message.error('Lỗi khi thêm vào yêu thích');
        }
    };

    const removeFromFavorites = async (productId) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                message.warning('Vui lòng đăng nhập để xóa khỏi yêu thích');
                return;
            }

            setFavorites(prev => prev.filter(fav => fav.product_id !== productId));
            message.success('Đã xóa khỏi yêu thích');
        } catch (error) {
            console.error('Error removing from favorites:', error);
            message.error('Lỗi khi xóa khỏi yêu thích');
        }
    };

    const isFavorite = (productId) => {
        return favorites.some(fav => fav.product_id === productId);
    };

    const value = {
        favorites,
        addToFavorites,
        removeFromFavorites,
        isFavorite
    };

    return (
        <FavoriteContext.Provider value={value}>
            {children}
        </FavoriteContext.Provider>
    );
}; 