import React, { useState } from 'react';
import { Drawer, Button, Typography, Space, Divider, message } from 'antd';
import { useCart } from './CartContext';
import { useNavigate } from 'react-router-dom';
import PaymentMethod from './PaymentMethod';
import { useAuth } from './AuthContext';
import axios from 'axios';

const { Title, Text } = Typography;

const Cart = ({ visible, onClose }) => {
    const { cartItems, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [showPayment, setShowPayment] = useState(false);

    const handleCheckout = () => {
        if (cartItems.length === 0) {
            message.warning('Giỏ hàng trống!');
            return;
        }
        setShowPayment(true);
    };

    const handlePaymentConfirm = async (paymentMethod, transactionId) => {
        if (!user) {
            message.error('Vui lòng đăng nhập để thanh toán');
            return;
        }

        try {
            console.log('Payment method received:', paymentMethod);
            // Create order data
            const orderData = {
                user_id: user.userId,
                total_amount: getCartTotal(),
                shipping_address: user.address || '',
                order_details: cartItems.map(item => ({
                    product_id: item.product_id,
                    quantity: item.quantity,
                    price: item.price
                })),
                payment: {
                    amount: getCartTotal(),
                    payment_method: paymentMethod === 'bank_transfer' ? 'bank_transfer' : 'cash',
                    payment_status: paymentMethod === 'bank_transfer' ? 'completed' : 'pending',
                    transaction_id: paymentMethod === 'bank_transfer' ? transactionId : null
                }
            };

            console.log('Order data being sent:', orderData);

            // Create order
            const response = await axios.post('http://localhost:8080/orders', orderData, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.data.success) {
                message.success('Đặt hàng thành công!');
                await clearCart();
                setShowPayment(false);
                onClose();
                navigate('/profile');
            } else {
                message.error(response.data.error || 'Có lỗi xảy ra khi đặt hàng');
            }
        } catch (error) {
            console.error('Error creating order:', error);
            if (error.response?.data?.error) {
                message.error(error.response.data.error);
            } else {
                message.error('Có lỗi xảy ra khi đặt hàng');
            }
        }
    };

    return (
        <Drawer
            title="Giỏ hàng"
            placement="right"
            onClose={() => {
                setShowPayment(false);
                onClose();
            }}
            open={visible}
            width={400}
        >
            {cartItems.length === 0 ? (
                <div className="text-center py-8">
                    <Text>Giỏ hàng trống</Text>
                </div>
            ) : (
                <div className="flex flex-col h-full">
                    <div className="flex-1 overflow-y-auto">
                        {cartItems.map(item => (
                            <div key={item.product_id} className="mb-4">
                                <div className="flex items-center justify-between">
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
                                    <Button 
                                        type="text" 
                                        danger 
                                        onClick={() => removeFromCart(item.product_id)}
                                    >
                                        Xóa
                                    </Button>
                                </div>
                                <div className="flex items-center justify-end mt-2">
                                    <Button 
                                        size="small"
                                        onClick={() => updateQuantity(item.product_id, Math.max(1, item.quantity - 1))}
                                    >
                                        -
                                    </Button>
                                    <Text className="mx-2">{item.quantity}</Text>
                                    <Button 
                                        size="small"
                                        onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                                    >
                                        +
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="border-t pt-4">
                        <div className="flex justify-between items-center mb-4">
                            <Text strong>Tổng tiền:</Text>
                            <Text strong className="text-lg">
                                {new Intl.NumberFormat('vi-VN', {
                                    style: 'currency',
                                    currency: 'VND'
                                }).format(getCartTotal())}
                            </Text>
                        </div>

                        {!showPayment ? (
                            <Button 
                                type="primary" 
                                block 
                                onClick={handleCheckout}
                            >
                                Thanh toán
                            </Button>
                        ) : (
                            <div className="space-y-4">
                                <PaymentMethod 
                                    onPaymentConfirm={handlePaymentConfirm}
                                    totalAmount={getCartTotal()}
                                />
                                <Button 
                                    block 
                                    onClick={() => setShowPayment(false)}
                                >
                                    Quay lại
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </Drawer>
    );
};

export default Cart; 