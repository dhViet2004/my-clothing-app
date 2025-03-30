import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AddProduct = () => {
  const navigate = useNavigate();
  const [product, setProduct] = useState({
    name: '',
    description: '',
    price: '',
    stock_quantity: '',
    category: 'quan_jean',
    url: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate required fields
    if (!product.name || !product.price || !product.stock_quantity || !product.category) {
      setError('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    // Validate number fields
    if (isNaN(product.price) || isNaN(product.stock_quantity)) {
      setError('Giá và số lượng phải là số');
      return;
    }

    // Convert number fields
    const productData = {
      ...product,
      price: parseFloat(product.price),
      stock_quantity: parseInt(product.stock_quantity)
    };

    try {
      const response = await axios.post('http://localhost:8080/products', productData);
      setSuccess('Sản phẩm đã được thêm thành công! Đang chuyển hướng...');
      
      setTimeout(() => {
        navigate('/ManagerProducts');
      }, 500);
      
    } catch (err) {
      console.error('Lỗi khi thêm sản phẩm:', err);
      setError(err.response?.data?.error || 'Đã xảy ra lỗi khi thêm sản phẩm. Vui lòng thử lại.');
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-md">
      <h1 className="text-2xl font-bold mb-6">Thêm Sản Phẩm Mới</h1>
      
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
      {success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">{success}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Tên sản phẩm *</label>
          <input
            type="text"
            name="name"
            value={product.name}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Mô tả</label>
          <textarea
            name="description"
            value={product.description}
            onChange={handleChange}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Giá *</label>
          <input
            type="number"
            name="price"
            value={product.price}
            onChange={handleChange}
            min="0"
            step="1000"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Số lượng tồn kho *</label>
          <input
            type="number"
            name="stock_quantity"
            value={product.stock_quantity}
            onChange={handleChange}
            min="0"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Danh mục *</label>
          <select
            name="category"
            value={product.category}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
            required
          >
            <option value="quan_jean">Quần Jean</option>
            <option value="quan_ao">Quần Áo</option>
            <option value="ao_khoac">Áo Khoác</option>
            <option value="ao_so_mi">Áo Sơ Mi</option>
            <option value="ao_len">Áo Len</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">URL hình ảnh</label>
          <input
            type="text"
            name="url"
            value={product.url}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
            placeholder="/images/image.jpg"
          />
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/ManagerProducts')}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Hủy
          </button>
          <button
            type="submit"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            Thêm Sản Phẩm
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProduct;