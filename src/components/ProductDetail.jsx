import React, { useState, useEffect } from 'react';
import { Button, Space, Typography, Rate, Tag, Divider, message } from 'antd';
import { ArrowLeftOutlined, ShoppingCartOutlined, HeartOutlined, HeartFilled } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCart } from './CartContext';
import { useFavorite } from './FavoriteContext';
import { useAuth } from './AuthContext';

const { Title, Text, Paragraph } = Typography;

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorite();
  const { user } = useAuth();

  const getCategoryName = (category) => {
    const categoryNames = {
      'dam_vay': 'Đầm/Váy',
      'quan_jean': 'Quần Jean',
      'quan_au': 'Quần Âu',
      'ao_so_mi': 'Áo Sơ Mi',
      'ao_khoac': 'Áo Khoác',
      'ao_len': 'Áo Len',
      'chan_vay': 'Chân Váy',
      'quan_short': 'Quần Short',
      'ao_phong': 'Áo Phông',
      'tuan_ao': 'Tuần Áo'
    };
    return categoryNames[category] || category;
  };

  useEffect(() => {
    const fetchProductDetail = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/products/${id}`);
        setProduct(response.data);
      } catch (error) {
        message.error('Lỗi khi tải chi tiết sản phẩm');
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetail();
  }, [id]);

  const handleAddToCart = () => {
    if (product) {
      addToCart(product);
      message.success('Đã thêm vào giỏ hàng');
    }
  };

  const handleToggleFavorite = () => {
    if (!user) {
      message.warning('Vui lòng đăng nhập để thêm vào yêu thích');
      return;
    }

    if (product) {
      if (isFavorite(product.product_id)) {
        removeFromFavorites(product.product_id);
      } else {
        addToFavorites(product);
      }
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!product) {
    return <div>Không tìm thấy sản phẩm</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button 
          type="text" 
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          Quay lại
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Image */}
        <div className="relative">
          <img
            src={product.url || '/images/placeholder-product.jpg'}
            alt={product.name}
            className="w-full h-auto rounded-lg shadow-lg"
            style={{ maxHeight: '600px', objectFit: 'cover' }}
          />
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <Title level={2}>{product.name}</Title>
            <Space className="mb-4">
              <Rate disabled defaultValue={product.rating || 4.5} allowHalf />
              <Text type="secondary">({product.rating || 4.5} sao)</Text>
            </Space>
            <Tag color="blue" className="mb-4">{getCategoryName(product.category)}</Tag>
          </div>

          <div>
            <Title level={3} style={{ color: '#ff4d4f' }}>
              {new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND'
              }).format(product.price)}
            </Title>
            <Tag color={product.stock_quantity > 0 ? 'green' : 'red'} className="mb-4">
              {product.stock_quantity > 0 ? 'Còn hàng' : 'Tạm hết'}
            </Tag>
          </div>

          <Divider />

          <div>
            <Title level={4}>Mô tả sản phẩm</Title>
            <Paragraph>
              {product.description || 'Không có mô tả sản phẩm'}
            </Paragraph>
          </div>

          <div className="space-y-4">
            <Button
              type="primary"
              icon={<ShoppingCartOutlined />}
              size="large"
              onClick={handleAddToCart}
              block
              disabled={product.stock_quantity <= 0}
            >
              Thêm vào giỏ hàng
            </Button>
            <Button
              icon={isFavorite(product.product_id) ? <HeartFilled style={{ color: 'red' }} /> : <HeartOutlined />}
              size="large"
              onClick={handleToggleFavorite}
              block
            >
              {isFavorite(product.product_id) ? 'Đã thêm vào yêu thích' : 'Thêm vào yêu thích'}
            </Button>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <Title level={5}>Thông tin sản phẩm</Title>
            <Space direction="vertical" className="w-full">
              <div className="flex justify-between">
                <Text type="secondary">Danh mục:</Text>
                <Text>{getCategoryName(product.category)}</Text>
              </div>
              <div className="flex justify-between">
                <Text type="secondary">Số lượng còn lại:</Text>
                <Text>{product.stock_quantity}</Text>
              </div>
              <div className="flex justify-between">
                <Text type="secondary">Đánh giá:</Text>
                <Text>{product.rating || 4.5} / 5</Text>
              </div>
            </Space>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;