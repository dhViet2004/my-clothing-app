import React, { useState, useEffect } from 'react';
import { Card, Tag, Button, Space, Skeleton, message, Rate, Typography } from 'antd';
import { ShoppingCartOutlined, HeartOutlined, EyeOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import axios from '../api/axiosConfig';
import { useCart } from './CartContext';
import { useAuth } from './AuthContext';

const { Meta } = Card;
const { Text, Paragraph } = Typography;

const ProductCard = ({
    product,
    isDetailView = false
}) => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [productDetail, setProductDetail] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isFavorite, setIsFavorite] = useState(false);
    const { addToCart } = useCart();
    const { user } = useAuth();

    useEffect(() => {
        if (isDetailView && id) {
            const fetchProductDetail = async () => {
                setLoading(true);
                try {
                    const response = await axios.get(`/products/${id}`);
                    setProductDetail(response.data);
                } catch (error) {
                    message.error('Lỗi khi tải chi tiết sản phẩm');
                    console.error('Error fetching product:', error);
                } finally {
                    setLoading(false);
                }
            };

            fetchProductDetail();
        }
    }, [id, isDetailView]);

    const handleAddToCart = (e) => {
        e?.stopPropagation();
        const productToAdd = isDetailView ? productDetail : product;
        addToCart(productToAdd);
        message.success('Đã thêm vào giỏ hàng');
    };

    const toggleFavorite = (e) => {
        e?.stopPropagation();
        if (!user) {
            message.warning('Vui lòng đăng nhập để thêm vào yêu thích');
            return;
        }
        setIsFavorite(!isFavorite);
        message.success(!isFavorite ? 'Đã thêm vào yêu thích' : 'Đã bỏ khỏi yêu thích');
    };

    const navigateToDetail = () => {
        if (!isDetailView) {
            navigate(`/products/${product.product_id}`);
        }
    };

    if (isDetailView && loading) {
        return <Skeleton active paragraph={{ rows: 6 }} />;
    }

    const currentProduct = isDetailView ? productDetail : product;

    if (isDetailView && !currentProduct) {
        return <div>Không tìm thấy sản phẩm</div>;
    }

    // Responsive styles
    const cardStyle = {
        width: isDetailView ? '100%' : '100%',
        maxWidth: isDetailView ? '800px' : '300px',
        margin: '0 auto',
        position: 'relative',
        borderRadius: '8px',
        overflow: 'hidden'
    };

    const imageStyle = {
        height: isDetailView ? '400px' : '200px',
        objectFit: 'cover',
        cursor: !isDetailView ? 'pointer' : 'default',
        transition: 'transform 0.3s',
        width: '100%'
    };

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

    return (
        <Card
            hoverable={!isDetailView}
            style={cardStyle}
            cover={
                <img
                    alt={currentProduct.name}
                    src={currentProduct.url || '/images/placeholder-product.jpg'}
                    style={imageStyle}
                    onClick={navigateToDetail}
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/images/placeholder-product.jpg';
                    }}
                />
            }
            actions={!isDetailView ? [
                <Button
                    type="text"
                    icon={<HeartOutlined style={{ color: isFavorite ? 'red' : undefined }} />}
                    onClick={toggleFavorite}
                    aria-label="Thêm vào yêu thích"
                />,
                <Button
                    type="text"
                    icon={<ShoppingCartOutlined />}
                    onClick={handleAddToCart}
                    aria-label="Thêm vào giỏ hàng"
                />,
                <Button
                    type="text"
                    icon={<EyeOutlined />}
                    onClick={navigateToDetail}
                    aria-label="Xem chi tiết"
                />
            ] : null}
            styles={{ padding: isDetailView ? '24px' : '12px' }}
        >
            <div onClick={!isDetailView ? navigateToDetail : undefined}>
                <Meta
                    title={<Text strong ellipsis={{ tooltip: currentProduct.name }}>{currentProduct.name}</Text>}
                    description={
                        <Space direction="vertical" size="small" style={{ width: '100%' }}>
                            <Rate
                                disabled
                                defaultValue={currentProduct.rating || 4.5}
                                allowHalf
                                style={{ fontSize: '14px' }}
                            />
                            
                            <Tag color="blue" style={{ marginRight: 0 }}>
                                {getCategoryName(currentProduct.category)}
                            </Tag>
                            
                            <Text strong style={{ fontSize: isDetailView ? '20px' : '16px', color: '#ff4d4f' }}>
                                {new Intl.NumberFormat('vi-VN', {
                                    style: 'currency',
                                    currency: 'VND'
                                }).format(currentProduct.price)}
                            </Text>
                            
                            <Tag color={currentProduct.stock_quantity > 0 ? 'green' : 'red'}>
                                {currentProduct.stock_quantity > 0 ? 'Còn hàng' : 'Tạm hết'}
                            </Tag>

                            {isDetailView && (
                                <div style={{ marginTop: '16px' }}>
                                    <Paragraph>
                                        <Text strong>Mô tả sản phẩm:</Text>
                                        <br />
                                        {currentProduct.description || 'Không có mô tả'}
                                    </Paragraph>

                                    <Button
                                        type="primary"
                                        icon={<ShoppingCartOutlined />}
                                        size="large"
                                        onClick={handleAddToCart}
                                        style={{ marginTop: '16px', width: '100%' }}
                                        block
                                    >
                                        Thêm vào giỏ hàng
                                    </Button>
                                </div>
                            )}
                        </Space>
                    }
                />
            </div>
        </Card>
    );
};

export default ProductCard;