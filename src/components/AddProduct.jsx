import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import instance from '../api/axiosConfig';

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

    if (!product.name || !product.price || !product.stock_quantity || !product.category) {
      setError('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    if (isNaN(product.price) || isNaN(product.stock_quantity)) {
      setError('Giá và số lượng phải là số');
      return;
    }

    const productData = {
      ...product,
      price: parseFloat(product.price),
      stock_quantity: parseInt(product.stock_quantity)
    };

    try {
      await instance.post('http://localhost:8080/products', productData);
      setSuccess('Sản phẩm đã được thêm thành công!');

      setTimeout(() => {
        navigate('/admin/managerProducts');
      }, 500);
    } catch (err) {
      console.error('Lỗi khi thêm sản phẩm:', err);
      setError(err.response?.data?.error || 'Đã xảy ra lỗi khi thêm sản phẩm.');
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-md">
      <h1 className="text-2xl font-bold mb-6">Thêm Sản Phẩm Mới</h1>

      {error && <div className="bg-red-100 text-red-700 p-2 rounded mb-4">{error}</div>}
      {success && <div className="bg-green-100 text-green-700 p-2 rounded mb-4">{success}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Tên */}
        <div>
          <label className="block font-medium">Tên sản phẩm *</label>
          <input
            type="text"
            name="name"
            value={product.name}
            onChange={handleChange}
            required
            className="w-full border p-2 rounded"
          />
        </div>

        {/* Mô tả */}
        <div>
          <label className="block font-medium">Mô tả</label>
          <textarea
            name="description"
            value={product.description}
            onChange={handleChange}
            rows={3}
            className="w-full border p-2 rounded"
          />
        </div>

        {/* Giá */}
        <div>
          <label className="block font-medium">Giá *</label>
          <input
            type="number"
            name="price"
            value={product.price}
            onChange={handleChange}
            required
            className="w-full border p-2 rounded"
          />
        </div>

        {/* Số lượng */}
        <div>
          <label className="block font-medium">Số lượng tồn kho *</label>
          <input
            type="number"
            name="stock_quantity"
            value={product.stock_quantity}
            onChange={handleChange}
            required
            className="w-full border p-2 rounded"
          />
        </div>

        {/* Danh mục */}
        <div>
          <label className="block font-medium">Danh mục *</label>
          <select
            name="category"
            value={product.category}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          >
            <option value="dam_vay">Đầm/Váy</option>
            <option value="quan_jean">Quần Jean</option>
            <option value="quan_au">Quần Âu</option>
            <option value="ao_so_mi">Áo Sơ Mi</option>
            <option value="ao_khoac">Áo Khoác</option>
            <option value="ao_len">Áo Len</option>
            <option value="chan_vay">Chân Váy</option>
            <option value="quan_short">Quần Short</option>
            <option value="ao_phong">Áo Phông</option>
          </select>
        </div>

        {/* URL hình ảnh */}
        <div>
          <label className="block font-medium">URL hình ảnh</label>
          <input
            type="text"
            name="url"
            value={product.url}
            onChange={handleChange}
            placeholder="/images/image.jpg"
            className="w-full border p-2 rounded"
          />
        </div>

        {/* Nút hành động */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/admin/managerProducts')}
            className="px-4 py-2 border rounded bg-gray-100 hover:bg-gray-200"
          >
            Hủy
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Thêm sản phẩm
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProduct;