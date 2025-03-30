import React, { useState, useEffect } from 'react';
import { Card, Tag, Button, Space, Skeleton, message, Rate } from 'antd';
import { ShoppingCartOutlined, HeartOutlined, EyeOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const { Meta } = Card;

const ProductCard = ({
    product,
    isDetailView = false
}) => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [productDetail, setProductDetail] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isFavorite, setIsFavorite] = useState(false);

    // Lấy chi tiết sản phẩm nếu là view chi tiết
    useEffect(() => {
        if (isDetailView && id) {
            const fetchProductDetail = async () => {
                setLoading(true);
                try {
                    const response = await axios.get(`http://localhost:8080/products/${id}`);
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

    const handleAddToCart = () => {
        message.success('Đã thêm vào giỏ hàng');
        // Thêm logic thêm vào giỏ hàng ở đây
    };

    const toggleFavorite = () => {
        setIsFavorite(!isFavorite);
        message.success(!isFavorite ? 'Đã thêm vào yêu thích' : 'Đã bỏ khỏi yêu thích');
    };

    // Nếu là view chi tiết và đang loading
    if (isDetailView && loading) {
        return <Skeleton active />;
    }

    // Sử dụng productDetail nếu là view chi tiết, ngược lại dùng product từ props
    const currentProduct = isDetailView ? productDetail : product;

    if (isDetailView && !currentProduct) {
        return <div>Không tìm thấy sản phẩm</div>;
    }

    return (
        <Card
            hoverable
            style={{
                width: isDetailView ? '100%' : 240,
                margin: '10px',
                position: 'relative'
            }}
            cover={
                <img
                    alt={currentProduct.name}
                    src={currentProduct.url || '/images/placeholder-product.jpg'}
                    style={{
                        height: isDetailView ? 400 : 240,
                        objectFit: 'cover',
                        cursor: 'pointer'
                    }}
                />
            }
            actions={!isDetailView ? [
                <Button
                    type="text"
                    icon={<HeartOutlined style={{ color: isFavorite ? 'red' : undefined }} />}
                    onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite();
                    }}
                />,
                <Button
                    type="text"
                    icon={<ShoppingCartOutlined />}
                    onClick={(e) => {
                        e.stopPropagation();
                        handleAddToCart();
                    }}
                />,
                <Button
                    type="text"
                    icon={<EyeOutlined />}
                    onClick={() => navigate(`/products/${currentProduct.product_id}`)}
                />
            ] : null}
        >
            <div
                onClick={() => !isDetailView && navigate(`/products/${currentProduct.product_id}`)}
                style={{ cursor: 'pointer' }}
            >
                <Meta
                    title={currentProduct.name}
                    description={
                        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                            <Rate
                                disabled
                                defaultValue={4.5}
                                allowHalf
                                style={{ fontSize: 14 }}
                            />
                            <Tag color="blue">{currentProduct.category}</Tag>
                            <span style={{ fontWeight: 'bold', fontSize: isDetailView ? 18 : 14 }}>
                                {new Intl.NumberFormat('vi-VN', {
                                    style: 'currency',
                                    currency: 'VND'
                                }).format(currentProduct.price)}
                            </span>
                            <Tag color={currentProduct.stock_quantity > 0 ? 'green' : 'red'}>
                                {currentProduct.stock_quantity > 0 ? `Còn hàng` : 'Tạm hết'}
                            </Tag>

                            {isDetailView && (
                                <div>
                                    <h4>Mô tả sản phẩm:</h4>
                                    <p>{currentProduct.description || 'Không có mô tả'}</p>

                                    <Button
                                        type="primary"
                                        icon={<ShoppingCartOutlined />}
                                        size="large"
                                        onClick={handleAddToCart}
                                        style={{ marginTop: 16 }}
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