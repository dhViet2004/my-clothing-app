import React from 'react';
import ManagerProducts from './pages/ManagerProducts';
import AddProduct from './components/AddProduct';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import ProductDetail from './components/ProductDetail';
import ProductList from './components/ProductList';
function App() {
    return (
        <BrowserRouter>
            <Header/>
            <Routes>
                <Route path='/Home' element={<Home/>}/>
                <Route path='/ManagerProducts' element={<ManagerProducts/>}/>
                <Route path="/products" element={<ProductList />} />
                <Route path="/add-product" element={<AddProduct />} />
                <Route path="/products/:id" element={<ProductDetail />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;