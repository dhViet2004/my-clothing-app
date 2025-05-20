import React, { useState } from 'react';
import { Typography, Card, Button, message, Divider, Space, Row, Col } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { useCart } from './CartContext';
import PaymentMethod from './PaymentMethod';
import axios from 'axios';

const { Title, Text } = Typography;

const Checkout = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { cartItems, getCartTotal, clearCart } = useCart();
    const [loading, setLoading] = useState(false);

    const handlePaymentConfirm = async (paymentMethod) => {
        if (!user) {
            message.error('Vui lòng đăng nhập để thanh toán');
            return;
        }

        setLoading(true);
        try {
            // Create order data
            const orderData = {
                user_id: user.userId,
                total_amount: getCartTotal(),
                shipping_address: user.address || '',
                order_details: cartItems.map(item => ({
                    product_id: item.product_id,
                    quantity: item.quantity,
                    price: item.price,
                    name: item.name,
                    url: item.url
                })),
                payment: {
                    amount: getCartTotal(),
                    payment_method: paymentMethod,
                    payment_status: paymentMethod === 'bank_transfer' ? 'completed' : 'pending',
                    transaction_id: paymentMethod === 'bank_transfer' ? form.getFieldValue('transactionId') : null
                }
            };

            // Create order
            const response = await axios.post('http://localhost:8080/orders', orderData, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.data.success) {
                message.success('Đặt hàng thành công! Hóa đơn đã được gửi về email của bạn.');
                
                // Clear cart after successful order
                await clearCart();
                
                // Navigate to order confirmation page
                navigate('/orders');
            } else {
                message.error('Có lỗi xảy ra khi đặt hàng');
            }
        } catch (error) {
            console.error('Error creating order:', error);
            message.error('Có lỗi xảy ra khi đặt hàng');
        } finally {
            setLoading(false);
        }
    };

    if (cartItems.length === 0) {
        return (
            <div className="text-center py-8">
                <Title level={3}>Giỏ hàng trống</Title>
                <Button type="primary" onClick={() => navigate('/products')}>
                    Tiếp tục mua sắm
                </Button>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8">
            <Title level={2} className="mb-6">Thanh toán</Title>
            
            <Row gutter={24}>
                <Col xs={24} md={16}>
                    <Card title="Thông tin đơn hàng" className="mb-6">
                        <div className="space-y-4">
                            {cartItems.map(item => (
                                <div key={item.product_id} className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <img 
                                            src={item.url || '/placeholder-product.jpg'} 
                                            alt={item.name} 
                                            className="w-16 h-16 object-cover mr-4"
                                        />
                                        <div>
                                            <Text strong>{item.name}</Text>
                                            <div className="text-gray-500">
                                                {new Intl.NumberFormat('vi-VN', {
                                                    style: 'currency',
                                                    currency: 'VND'
                                                }).format(item.price)} x {item.quantity}
                                            </div>
                                        </div>
                                    </div>
                                    <Text strong>
                                        {new Intl.NumberFormat('vi-VN', {
                                            style: 'currency',
                                            currency: 'VND'
                                        }).format(item.price * item.quantity)}
                                    </Text>
                                </div>
                            ))}
                        </div>
                        
                        <Divider />
                        
                        <div className="flex justify-between items-center">
                            <Text strong>Tổng tiền:</Text>
                            <Text strong className="text-lg">
                                {new Intl.NumberFormat('vi-VN', {
                                    style: 'currency',
                                    currency: 'VND'
                                }).format(getCartTotal())}
                            </Text>
                        </div>
                    </Card>
                </Col>
                
                <Col xs={24} md={8}>
                    <Card title="Phương thức thanh toán">
                        <PaymentMethod 
                            onPaymentConfirm={handlePaymentConfirm} 
                            totalAmount={getCartTotal()}
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default Checkout; 