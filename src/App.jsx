// App.js
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import ProductDetail from './components/ProductDetail';
import ProductList from './components/ProductList';
import AuthForm from './components/AuthForm';
import Admin from './pages/Admin';
import PrivateAdminRoute from './components/PrivateAdminRoute';
import './api/axiosConfig';
import { AuthProvider } from './components/AuthContext';
import Products from './pages/Products';
import AddProduct from './components/AddProduct';

function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 p-4 md:p-6 lg:p-8 mx-auto w-full max-w-7xl">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/login" element={<AuthForm />} />
          <Route path="/products/:id" element={<ProductDetail />} />
      
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public layout */}
          <Route path="/*" element={<PublicLayout />} />

          {/* Admin layout - no Header */}
          <Route
            path="/admin/*"
            element={
              <PrivateAdminRoute>
                <Admin />
              </PrivateAdminRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
