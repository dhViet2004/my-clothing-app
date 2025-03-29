import React from 'react';
import ManagerProducts from './pages/ManagerProducts';
import AddProduct from './components/AddProduct';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
function App() {
    return (
        <BrowserRouter>
            <Header/>
            <Routes>
                <Route path='/Home' element={<Home/>}/>
                <Route path='/ManagerProducts' element={<ManagerProducts/>}/>
                <Route path="/add-product" element={<AddProduct />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;