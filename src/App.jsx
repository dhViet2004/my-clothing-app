// App.js
import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import ProductDetail from './components/ProductDetail';
import ProductList from './components/ProductList';
import AuthForm from './components/AuthForm';
import Admin from './pages/Admin';
import PrivateAdminRoute from './components/PrivateAdminRoute';
import './api/axiosConfig';
import { AuthProvider, useAuth } from './components/AuthContext';
import { CartProvider } from './components/CartContext';
import { FavoriteProvider } from './components/FavoriteContext';
import Products from './pages/Products';
import AddProduct from './components/AddProduct';
import Cart from './components/Cart';
import Profile from './components/Profile';
import OrderManagement from './components/admin/OrderManagement';
import { GoogleOAuthProvider } from '@react-oauth/google';

// Protected Route component
const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();
    
    if (loading) {
        return <div>Loading...</div>;
    }
    
    if (!user) {
        return <Navigate to="/login" />;
    }
    
    return children;
};

function PublicLayout() {
    const [cartVisible, setCartVisible] = useState(false);
    const { user } = useAuth();

    return (
        <div className="min-h-screen flex flex-col">
            <Header onCartClick={() => setCartVisible(true)} />
            <main className="flex-1 p-4 md:p-6 lg:p-8 mx-auto w-full max-w-7xl">
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/home" element={<Home />} />
                    <Route path="/products" element={<Products />} />
                    <Route path="/login" element={<AuthForm />} />
                    <Route path="/products/:id" element={<ProductDetail />} />
                    <Route
                        path="/profile"
                        element={
                            <ProtectedRoute>
                                <Profile />
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </main>
            <Cart visible={cartVisible} onClose={() => setCartVisible(false)} />
        </div>
    );
}

function App() {
    return (
        <GoogleOAuthProvider clientId="175627284623-pl3oarbc99djsl3erhs5a11kfn8tk2qs.apps.googleusercontent.com">
            <AuthProvider>
                <CartProvider>
                    <FavoriteProvider>
                        <BrowserRouter>
                            <Routes>
                                {/* Public layout */}
                                <Route path="/*" element={<PublicLayout />} />

                                {/* Admin layout */}
                                <Route
                                    path="/admin/*"
                                    element={
                                        <PrivateAdminRoute>
                                            <Admin />
                                        </PrivateAdminRoute>
                                    }
                                >
                                    <Route index element={<Navigate to="dashboard" replace />} />
                                    <Route path="dashboard" element={<div>Dashboard</div>} />
                                    <Route path="managerProducts" element={<AddProduct />} />
                                    <Route path="orders" element={<OrderManagement />} />
                                    <Route path="Teams" element={<div>Teams</div>} />
                                    <Route path="Analytics" element={<div>Analytics</div>} />
                                    <Route path="Messages" element={<div>Messages</div>} />
                                    <Route path="Integrations" element={<div>Integrations</div>} />
                                </Route>
                            </Routes>
                        </BrowserRouter>
                    </FavoriteProvider>
                </CartProvider>
            </AuthProvider>
        </GoogleOAuthProvider>
    );
}

export default App;
