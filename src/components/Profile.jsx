import React, { useState, useEffect } from 'react';
import { Tabs, Card, List, Typography, Space, Tag, Button, Empty, message, InputNumber, Steps, Table, Descriptions, Modal, Form, Input } from 'antd';
import { ShoppingCartOutlined, HistoryOutlined, EyeOutlined, CheckCircleOutlined, ClockCircleOutlined, CarOutlined, CloseCircleOutlined, DollarOutlined, UserOutlined } from '@ant-design/icons';
import { useCart } from './CartContext';
import { useAuth } from './AuthContext';
import PaymentMethod from './PaymentMethod';
import axios from 'axios';

const { Title, Text } = Typography;

const Profile = () => {
    const { user, updateUserProfile, setUser } = useAuth();
    const { cartItems, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [orderDetails, setOrderDetails] = useState([]);
    const [paymentModalVisible, setPaymentModalVisible] = useState(false);
    const [form] = Form.useForm();

    // Separate orders into tracking and history
    const trackingOrders = orders.filter(order => order.status !== 'delivered' && order.status !== 'cancelled');
    const historyOrders = orders.filter(order => order.status === 'delivered' || order.status === 'cancelled');

    useEffect(() => {
        if (user && user.userId) {
            console.log('User ID:', user.userId);
            fetchOrders();
        }
    }, [user]);

    useEffect(() => {
        if (user) {
            form.setFieldsValue({
                username: user.username,
                full_name: user.full_name,
                email: user.email,
                phone: user.phone,
                address: user.address
            });
        }
    }, [user, form]);

    const fetchOrders = async () => {
        if (!user || !user.userId) {
            console.log('No user or user ID found');
            return;
        }
        
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                message.error('Vui lòng đăng nhập lại');
                return;
            }

            console.log('Fetching orders for user:', user.userId);
            const response = await axios.get(`http://localhost:8080/orders/user/${user.userId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            console.log('Orders response:', response.data);
            setOrders(response.data);
        } catch (error) {
            console.error('Error fetching orders:', error);
            if (error.response?.status === 401) {
                message.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại');
            } else if (error.response?.status === 403) {
                message.error('Không có quyền truy cập');
            } else {
                message.error('Lỗi khi tải lịch sử đơn hàng');
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchOrderDetails = async (orderId) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                message.error('Vui lòng đăng nhập lại');
                return;
            }

            console.log('Fetching details for order:', orderId);
            const response = await axios.get(`http://localhost:8080/orders/${orderId}/details`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            console.log('Order details response:', response.data);
            setOrderDetails(response.data);
        } catch (error) {
            console.error('Error fetching order details:', error);
            if (error.response?.status === 401) {
                message.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại');
            } else if (error.response?.status === 403) {
                message.error('Không có quyền truy cập');
            } else {
                message.error('Lỗi khi tải chi tiết đơn hàng');
            }
        }
    };

    const handleCheckout = () => {
        if (cartItems.length === 0) {
            message.warning('Giỏ hàng trống!');
            return;
        }
        setPaymentModalVisible(true);
    };

    const handlePaymentConfirm = async (paymentMethod, transactionId) => {
        if (!user) {
            message.error('Vui lòng đăng nhập để thanh toán');
            return;
        }

        try {
            // Validate required fields
            if (!user.address) {
                message.error('Vui lòng cập nhật địa chỉ giao hàng trong thông tin tài khoản');
                return;
            }

            // Create order data
            const orderData = {
                user_id: user.userId,
                total_amount: getCartTotal(),
                shipping_address: user.address,
                order_date: new Date().toISOString(),
                status: 'pending',
                order_details: cartItems.map(item => ({
                    product_id: item.product_id,
                    quantity: item.quantity,
                    price: item.price,
                    name: item.name,
                    url: item.url
                })),
                payment: {
                    amount: getCartTotal(),
                    payment_method: paymentMethod === 'bank_transfer' ? 'bank_transfer' : 'cash',
                    payment_status: paymentMethod === 'bank_transfer' ? 'completed' : 'pending',
                    payment_date: new Date().toISOString(),
                    transaction_id: paymentMethod === 'bank_transfer' ? transactionId : null
                }
            };

            console.log('Sending order data:', orderData);

            // Create order
            const response = await axios.post('http://localhost:8080/orders', orderData, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.data.success) {
                message.success('Đặt hàng thành công!');
                
                // Clear cart after successful order
                await clearCart();
                
                // Close payment modal
                setPaymentModalVisible(false);
                
                // Refresh orders
                fetchOrders();
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

    const getOrderStatusColor = (status) => {
        const statusColors = {
            pending: 'orange',
            processing: 'blue',
            shipped: 'cyan',
            delivered: 'green',
            cancelled: 'red'
        };
        return statusColors[status] || 'default';
    };

    const getOrderStatusText = (status) => {
        const statusTexts = {
            pending: 'Chờ xử lý',
            processing: 'Đang xử lý',
            shipped: 'Đang giao hàng',
            delivered: 'Đã giao hàng',
            cancelled: 'Đã hủy'
        };
        return statusTexts[status] || status;
    };

    const getOrderStatusStep = (status) => {
        const statusSteps = {
            pending: 0,
            processing: 1,
            shipped: 2,
            delivered: 3,
            cancelled: 3
        };
        return statusSteps[status] || 0;
    };

    const getOrderStatusIcon = (status) => {
        const icons = {
            pending: <ClockCircleOutlined />,
            processing: <ClockCircleOutlined />,
            shipped: <CarOutlined />,
            delivered: <CheckCircleOutlined />,
            cancelled: <CloseCircleOutlined />
        };
        return icons[status] || <ClockCircleOutlined />;
    };

    const handleViewOrderDetails = async (order) => {
        setSelectedOrder(order);
        await fetchOrderDetails(order.order_id);
    };

    const OrderDetailModal = ({ order, details, visible, onClose }) => {
        if (!order) return null;

        const getPaymentMethodText = (method) => {
            switch (method) {
                case 'cash':
                    return 'Tiền mặt';
                case 'bank_transfer':
                    return 'Chuyển khoản';
                default:
                    return method;
            }
        };

        return (
            <Modal
                title={`Chi tiết đơn hàng #${order.order_id}`}
                open={visible}
                onCancel={onClose}
                footer={null}
                width={800}
            >
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                    <div>
                        <Title level={4}>Đơn hàng #{order.order_id}</Title>
                        <Text type="secondary">
                            Ngày đặt: {new Date(order.order_date).toLocaleDateString('vi-VN')}
                        </Text>
                    </div>
                    
                    <Steps
                        current={getOrderStatusStep(order.status)}
                        status={order.status === 'cancelled' ? 'error' : 'process'}
                        items={[
                            {
                                title: 'Chờ xử lý',
                                description: 'Đơn hàng đã được đặt',
                                icon: getOrderStatusIcon('pending')
                            },
                            {
                                title: 'Đang xử lý',
                                description: 'Đơn hàng đang được xử lý',
                                icon: getOrderStatusIcon('processing')
                            },
                            {
                                title: 'Đang giao hàng',
                                description: 'Đơn hàng đang được vận chuyển',
                                icon: getOrderStatusIcon('shipped')
                            },
                            {
                                title: 'Hoàn thành',
                                description: 'Đơn hàng đã được giao',
                                icon: getOrderStatusIcon('delivered')
                            }
                        ]}
                    />

                    <Descriptions title="Thông tin đơn hàng" bordered>
                        <Descriptions.Item label="Mã đơn hàng">#{order.order_id}</Descriptions.Item>
                        <Descriptions.Item label="Trạng thái">
                            <Tag color={getOrderStatusColor(order.status)}>
                                {getOrderStatusText(order.status)}
                            </Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Ngày đặt">
                            {new Date(order.order_date).toLocaleDateString('vi-VN')}
                        </Descriptions.Item>
                        <Descriptions.Item label="Địa chỉ giao hàng" span={3}>
                            {order.shipping_address}
                        </Descriptions.Item>
                        <Descriptions.Item label="Phương thức thanh toán">
                            {getPaymentMethodText(details[0]?.payment_method)}
                        </Descriptions.Item>
                        <Descriptions.Item label="Trạng thái thanh toán">
                            <Tag color={details[0]?.payment_status === 'completed' ? 'green' : 'orange'}>
                                {details[0]?.payment_status === 'completed' ? 'Đã thanh toán' : 'Chờ thanh toán'}
                            </Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Tổng tiền">
                            {new Intl.NumberFormat('vi-VN', {
                                style: 'currency',
                                currency: 'VND'
                            }).format(order.total_amount)}
                        </Descriptions.Item>
                    </Descriptions>

                    <div>
                        <Title level={5}>Chi tiết sản phẩm</Title>
                        <Table
                            columns={orderColumns}
                            dataSource={details}
                            rowKey="order_detail_id"
                            pagination={false}
                        />
                    </div>
                </Space>
            </Modal>
        );
    };

    const orderColumns = [
        {
            title: 'Sản phẩm',
            dataIndex: 'name',
            key: 'name',
            render: (text, record) => (
                <Space>
                    <img
                        src={record.url || '/images/placeholder-product.jpg'}
                        alt={text}
                        style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 4 }}
                    />
                    <Text>{text}</Text>
                </Space>
            )
        },
        {
            title: 'Số lượng',
            dataIndex: 'quantity',
            key: 'quantity',
            align: 'center'
        },
        {
            title: 'Đơn giá',
            dataIndex: 'price',
            key: 'price',
            render: (price) => (
                <Text>
                    {new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND'
                    }).format(price)}
                </Text>
            )
        },
        {
            title: 'Thành tiền',
            key: 'total',
            render: (_, record) => (
                <Text>
                    {new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND'
                    }).format(record.price * record.quantity)}
                </Text>
            )
        }
    ];

    const handleUpdateProfile = async (values) => {
        try {
            const success = await updateUserProfile(values);
            if (success) {
                message.success('Cập nhật thông tin thành công!');
                // Refresh user data
                const token = localStorage.getItem('token');
                if (token) {
                    const response = await axios.get('http://localhost:8080/profile', {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    if (response.data.success) {
                        const userData = response.data.user;
                        setUser(userData);
                        localStorage.setItem('user', JSON.stringify(userData));
                    }
                }
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            message.error('Có lỗi xảy ra khi cập nhật thông tin');
        }
    };

    const items = [
        {
            key: 'profile',
            label: (
                <span>
                    <UserOutlined />
                    Thông tin cá nhân
                </span>
            ),
            children: (
                <div className="max-w-2xl mx-auto">
                    <Form
                        form={form}
                        layout="vertical"
                        initialValues={{
                            username: user?.username,
                            full_name: user?.full_name,
                            email: user?.email,
                            phone: user?.phone,
                            address: user?.address
                        }}
                        onFinish={handleUpdateProfile}
                    >
                        <Form.Item
                            name="username"
                            label="Tên đăng nhập"
                            rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập' }]}
                        >
                            <Input disabled />
                        </Form.Item>

                        <Form.Item
                            name="full_name"
                            label="Họ và tên"
                            rules={[{ required: true, message: 'Vui lòng nhập họ và tên' }]}
                        >
                            <Input />
                        </Form.Item>

                        <Form.Item
                            name="email"
                            label="Email"
                            rules={[
                                { required: true, message: 'Vui lòng nhập email' },
                                { type: 'email', message: 'Email không hợp lệ' }
                            ]}
                        >
                            <Input />
                        </Form.Item>

                        <Form.Item
                            name="phone"
                            label="Số điện thoại"
                            rules={[
                                { required: true, message: 'Vui lòng nhập số điện thoại' },
                                { pattern: /^[0-9]{10}$/, message: 'Số điện thoại không hợp lệ' }
                            ]}
                        >
                            <Input />
                        </Form.Item>

                        <Form.Item
                            name="address"
                            label="Địa chỉ"
                            rules={[{ required: true, message: 'Vui lòng nhập địa chỉ' }]}
                        >
                            <Input.TextArea rows={3} placeholder="Nhập địa chỉ giao hàng" />
                        </Form.Item>

                        <Form.Item>
                            <Button type="primary" htmlType="submit">
                                Cập nhật thông tin
                            </Button>
                        </Form.Item>
                    </Form>
                </div>
            )
        },
        {
            key: 'cart',
            label: (
                <span>
                    <ShoppingCartOutlined />
                    Giỏ hàng
                </span>
            ),
            children: (
                <>
                    {cartItems.length === 0 ? (
                        <Empty description="Giỏ hàng trống" />
                    ) : (
                        <>
                            <List
                                itemLayout="horizontal"
                                dataSource={cartItems}
                                renderItem={(item) => (
                                    <List.Item
                                        actions={[
                                            <Button
                                                type="text"
                                                danger
                                                onClick={() => removeFromCart(item.product_id)}
                                            >
                                                Xóa
                                            </Button>
                                        ]}
                                    >
                                        <List.Item.Meta
                                            avatar={
                                                <img
                                                    src={item.url || '/images/placeholder-product.jpg'}
                                                    alt={item.name}
                                                    style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 4 }}
                                                />
                                            }
                                            title={item.name}
                                            description={
                                                <Space direction="vertical">
                                                    <Text>
                                                        {new Intl.NumberFormat('vi-VN', {
                                                            style: 'currency',
                                                            currency: 'VND'
                                                        }).format(item.price)}
                                                    </Text>
                                                    <InputNumber
                                                        min={1}
                                                        value={item.quantity}
                                                        onChange={(value) => updateQuantity(item.product_id, value)}
                                                    />
                                                </Space>
                                            }
                                        />
                                    </List.Item>
                                )}
                            />
                            <div className="mt-4 text-right">
                                <Title level={4}>
                                    Tổng cộng:{' '}
                                    {new Intl.NumberFormat('vi-VN', {
                                        style: 'currency',
                                        currency: 'VND'
                                    }).format(getCartTotal())}
                                </Title>
                                <Button
                                    type="primary"
                                    size="large"
                                    onClick={handleCheckout}
                                    className="mt-2"
                                >
                                    Thanh toán
                                </Button>
                            </div>
                        </>
                    )}
                </>
            )
        },
        {
            key: 'tracking',
            label: (
                <span>
                    <EyeOutlined />
                    Theo dõi đơn hàng
                </span>
            ),
            children: trackingOrders.length === 0 ? (
                <Empty description="Không có đơn hàng đang theo dõi" />
            ) : (
                <List
                    itemLayout="vertical"
                    dataSource={trackingOrders}
                    renderItem={(order) => (
                        <List.Item
                            key={order.order_id}
                            actions={[
                                <Button
                                    type="text"
                                    icon={<EyeOutlined />}
                                    onClick={() => handleViewOrderDetails(order)}
                                >
                                    Chi tiết
                                </Button>
                            ]}
                        >
                            <List.Item.Meta
                                title={
                                    <Space>
                                        <Text strong>Đơn hàng #{order.order_id}</Text>
                                        <Tag color={getOrderStatusColor(order.status)}>
                                            {getOrderStatusText(order.status)}
                                        </Tag>
                                    </Space>
                                }
                                description={
                                    <Space direction="vertical" size="small">
                                        <Text type="secondary">
                                            Ngày đặt: {new Date(order.order_date).toLocaleDateString('vi-VN')}
                                        </Text>
                                        <Text type="secondary">
                                            Tổng tiền:{' '}
                                            {new Intl.NumberFormat('vi-VN', {
                                                style: 'currency',
                                                currency: 'VND'
                                            }).format(order.total_amount)}
                                        </Text>
                                    </Space>
                                }
                            />
                        </List.Item>
                    )}
                />
            )
        },
        {
            key: 'history',
            label: (
                <span>
                    <HistoryOutlined />
                    Lịch sử đơn hàng
                </span>
            ),
            children: historyOrders.length === 0 ? (
                <Empty description="Chưa có đơn hàng nào" />
            ) : (
                <List
                    itemLayout="vertical"
                    dataSource={historyOrders}
                    renderItem={(order) => (
                        <List.Item
                            key={order.order_id}
                            actions={[
                                <Button
                                    type="text"
                                    icon={<EyeOutlined />}
                                    onClick={() => handleViewOrderDetails(order)}
                                >
                                    Chi tiết
                                </Button>
                            ]}
                        >
                            <List.Item.Meta
                                title={
                                    <Space>
                                        <Text strong>Đơn hàng #{order.order_id}</Text>
                                        <Tag color={getOrderStatusColor(order.status)}>
                                            {getOrderStatusText(order.status)}
                                        </Tag>
                                    </Space>
                                }
                                description={
                                    <Space direction="vertical" size="small">
                                        <Text type="secondary">
                                            Ngày đặt: {new Date(order.order_date).toLocaleDateString('vi-VN')}
                                        </Text>
                                        <Text type="secondary">
                                            Tổng tiền:{' '}
                                            {new Intl.NumberFormat('vi-VN', {
                                                style: 'currency',
                                                currency: 'VND'
                                            }).format(order.total_amount)}
                                        </Text>
                                    </Space>
                                }
                            />
                        </List.Item>
                    )}
                />
            )
        }
    ];

    return (
        <div className="container mx-auto px-4 py-8">
            <Card>
                <Title level={2}>Tài khoản của tôi</Title>
                <Text type="secondary">Xin chào, {user?.username}</Text>

                <Tabs defaultActiveKey="profile" className="mt-6" items={items} />
            </Card>

            <Modal
                title="Thanh toán"
                open={paymentModalVisible}
                onCancel={() => setPaymentModalVisible(false)}
                footer={null}
                width={600}
            >
                <PaymentMethod 
                    onPaymentConfirm={handlePaymentConfirm}
                    totalAmount={getCartTotal()}
                />
            </Modal>

            <OrderDetailModal
                order={selectedOrder}
                details={orderDetails}
                visible={!!selectedOrder}
                onClose={() => setSelectedOrder(null)}
            />
        </div>
    );
};

export default Profile; 