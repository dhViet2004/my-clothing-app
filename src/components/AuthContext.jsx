import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { message } from 'antd';

// Create context
const AuthContext = createContext(null);

// Custom hook to use auth context
const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

// Auth Provider component
const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('user');
        return savedUser ? JSON.parse(savedUser) : null;
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            // Set default authorization header
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            // Fetch user data
            fetchUserData();
        } else {
            setLoading(false);
        }
    }, []);

    const fetchUserData = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setLoading(false);
                return;
            }

            // Fetch user data from the server
            const response = await axios.get('http://localhost:8080/profile', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.data.success) {
                const userData = response.data.user;
                setUser(userData);
                localStorage.setItem('user', JSON.stringify(userData));
            } else {
                console.warn('Could not fetch user data');
            }
        } catch (error) {
            console.error('Error in fetchUserData:', error);
            // Only logout if there's a critical error
            if (error.response && error.response.status === 401) {
                logout();
            }
        } finally {
            setLoading(false);
        }
    };

    const login = async (username, password) => {
        try {
            const response = await axios.post('http://localhost:8080/login', {
                username,
                password
            });

            const { token, user: userData } = response.data;
            if (!token || !userData) {
                throw new Error('Invalid response from server');
            }

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(userData));
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            setUser(userData);
            message.success('Đăng nhập thành công!');

            // Redirect based on role
            if (userData.role === 'admin') {
                window.location.href = 'http://localhost:5173/admin';
            } else {
                window.location.href = '/profile';
            }

            return userData;
        } catch (error) {
            message.error('Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin!');
            console.error('Login error:', error);
            return null;
        }
    };

    const register = async (userData) => {
        try {
            const response = await axios.post('http://localhost:8080/auth/register', userData);
            message.success('Đăng ký thành công! Vui lòng đăng nhập.');
            return true;
        } catch (error) {
            message.error('Đăng ký thất bại. Vui lòng thử lại!');
            console.error('Registration error:', error);
            return false;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        delete axios.defaults.headers.common['Authorization'];
        setUser(null);
        message.success('Đăng xuất thành công!');
    };

    const updateUserProfile = async (userData) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Vui lòng đăng nhập lại');
            }

            const response = await axios.put(`http://localhost:8080/users/${user.userId}`, userData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.data.success) {
                // Update user in state and localStorage
                const updatedUser = { ...user, ...userData };
                setUser(updatedUser);
                localStorage.setItem('user', JSON.stringify(updatedUser));
                return true;
            } else {
                throw new Error(response.data.error || 'Có lỗi xảy ra khi cập nhật thông tin');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            throw error;
        }
    };

    const value = {
        user,
        loading,
        login,
        register,
        logout,
        updateUserProfile
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

// Export everything as named exports
export { AuthProvider, useAuth, AuthContext };