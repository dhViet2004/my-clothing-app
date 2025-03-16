import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ProductList = () => {
    const [products, setProducts] = useState([]);

    // Lấy dữ liệu từ API
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await axios.get('http://localhost:8080/products');
                setProducts(response.data);
            } catch (error) {
                console.error('Lỗi khi lấy sản phẩm:', error);
            }
        };
        fetchProducts();
    }, []);

    return (
        <div>
            <h2>Danh sách sản phẩm</h2>
            <ul>
                {products.map((product) => (
                    <li key={product.product_id}>
                        {product.name} - {product.price} VND (Số lượng: {product.stock_quantity})
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ProductList;