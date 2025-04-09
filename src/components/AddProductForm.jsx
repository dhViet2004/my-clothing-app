import React, { useState } from 'react';
import instance from '../api/axiosConfig';
import { FiPlus, FiX, FiImage, FiDollarSign, FiHash } from 'react-icons/fi';

const AddProductForm = ({ onSuccess, onClose }) => {
  const [product, setProduct] = useState({
    name: '',
    description: '',
    price: '',
    stock_quantity: '',
    category: 'quan_jean',
    url: ''
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    if (!product.name || !product.price || !product.stock_quantity) {
      setError('Vui lòng nhập đủ thông tin bắt buộc');
      setIsSubmitting(false);
      return;
    }

    try {
      await instance.post('/products', {
        ...product,
        price: parseFloat(product.price),
        stock_quantity: parseInt(product.stock_quantity)
      });

      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Lỗi khi thêm sản phẩm');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 font-sans">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-light text-gray-800">Thêm sản phẩm mới</h2>
        <button 
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 transition-colors"
        >
          <FiX size={24} />
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-rose-100 text-rose-700 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label className="text-sm text-gray-600">Tên sản phẩm *</label>
          <div className="relative">
            <input
              type="text"
              name="name"
              value={product.name}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent focus:outline-none"
              placeholder="Ví dụ: Áo thun cổ tròn"
              required
            />
            <FiPlus className="absolute right-3 top-3.5 text-gray-400" />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm text-gray-600">Mô tả</label>
          <textarea
            name="description"
            value={product.description}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent focus:outline-none"
            placeholder="Mô tả chi tiết sản phẩm..."
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-sm text-gray-600">Giá *</label>
            <div className="relative">
              <input
                type="text" 
                inputMode="numeric"  
                pattern="[0-9]*"  
                name="price"
                value={product.price}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent focus:outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                placeholder="0"
                required
              />
              <FiDollarSign className="absolute right-3 top-3.5 text-gray-400" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm text-gray-600">Số lượng *</label>
            <div className="relative">
              <input
                type="text"  
                inputMode="numeric"
                pattern="[0-9]*"
                name="stock_quantity"
                value={product.stock_quantity}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent focus:outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                placeholder="0"
                required
              />
              <FiHash className="absolute right-3 top-3.5 text-gray-400" />
            </div>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm text-gray-600">Danh mục *</label>
          <select
            name="category"
            value={product.category}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent focus:outline-none appearance-none bg-white"
          >
            <option value="quan_jean">Quần Jean</option>
            <option value="quan_ao">Quần Áo</option>
            <option value="ao_khoac">Áo Khoác</option>
            <option value="ao_so_mi">Áo Sơ Mi</option>
            <option value="ao_len">Áo Len</option>
            <option value="dam_vay">Đầm/Váy</option>
            <option value="chan_vay">Chân váy</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-sm text-gray-600">Hình ảnh</label>
          <div className="relative">
            <input
              name="url"
              value={product.url}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent focus:outline-none"
              placeholder="https://example.com/image.jpg"
            />
            <FiImage className="absolute right-3 top-3.5 text-gray-400" />
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Hủy bỏ
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors disabled:opacity-70 flex items-center"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Đang thêm...
              </>
            ) : (
              'Thêm sản phẩm'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProductForm;