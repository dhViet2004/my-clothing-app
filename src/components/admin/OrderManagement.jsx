import React, { useState, useEffect } from 'react';
import { Table, Card, Tag, Button, message, Space, Modal, Select } from 'antd';
import { EyeOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Option } = Select;

const OrderManagement = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        if (!isInitialized) {
            console.log('Initial fetch of orders');
            fetchOrders();
            setIsInitialized(true);
        }
    }, [isInitialized]);

    const fetchOrders = async () => {
        if (loading) {
            console.log('Fetch already in progress, skipping');
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                message.error('Vui lòng đăng nhập lại');
                return;
            }

            console.log('Starting to fetch orders...');
            const response = await axios.get('http://localhost:8080/admin/orders', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            console.log('Raw response data:', response.data);
            
            // Deduplicate orders based on order_id
            const uniqueOrders = Array.from(
                new Map(response.data.map(order => [order.order_id, order])).values()
            );
            
            console.log('Original orders count:', response.data.length);
            console.log('Unique orders count:', uniqueOrders.length);
            
            // Add index to each order for additional uniqueness in keys
            const ordersWithIndex = uniqueOrders.map((order, index) => ({
                ...order,
                uniqueIndex: index
            }));
            
            console.log('Final orders to be set:', ordersWithIndex);
            setOrders(ordersWithIndex);
        } catch (error) {
            console.error('Error fetching orders:', error);
            if (error.response?.status === 401) {
                message.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại');
            } else if (error.response?.status === 403) {
                message.error('Không có quyền truy cập');
            } else {
                message.error('Lỗi khi tải danh sách đơn hàng');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleViewOrder = (order) => {
        setSelectedOrder(order);
        setIsModalVisible(true);
    };

    const handleUpdateStatus = async (orderId, newStatus) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                message.error('Vui lòng đăng nhập lại');
                return;
            }

            console.log('Updating order status:', { orderId, newStatus });
            await axios.put(`http://localhost:8080/admin/orders/${orderId}/status`, 
                { status: newStatus },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            message.success('Cập nhật trạng thái đơn hàng thành công');
            fetchOrders();
        } catch (error) {
            console.error('Error updating order status:', error);
            if (error.response?.status === 401) {
                message.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại');
            } else if (error.response?.status === 403) {
                message.error('Không có quyền truy cập');
            } else {
                message.error('Lỗi khi cập nhật trạng thái đơn hàng');
            }
        }
    };

    const getStatusColor = (status) => {
        const statusColors = {
            pending: 'orange',
            processing: 'blue',
            shipped: 'cyan',
            delivered: 'green',
            cancelled: 'red'
        };
        return statusColors[status] || 'default';
    };

    const getStatusText = (status) => {
        const statusTexts = {
            pending: 'Chờ xử lý',
            processing: 'Đang xử lý',
            shipped: 'Đang giao hàng',
            delivered: 'Đã giao hàng',
            cancelled: 'Đã hủy'
        };
        return statusTexts[status] || status;
    };

    const columns = [
        {
            title: 'Mã đơn hàng',
            dataIndex: 'order_id',
            key: 'order_id',
        },
        {
            title: 'Khách hàng',
            dataIndex: 'username',
            key: 'username',
        },
        {
            title: 'Ngày đặt',
            dataIndex: 'order_date',
            key: 'order_date',
            render: (date) => new Date(date).toLocaleDateString('vi-VN')
        },
        {
            title: 'Tổng tiền',
            dataIndex: 'total_amount',
            key: 'total_amount',
            render: (amount) => new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND'
            }).format(amount)
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
                <Tag color={getStatusColor(status)}>
                    {getStatusText(status)}
                </Tag>
            )
        },
        {
            title: 'Thao tác',
            key: 'action',
            render: (_, record) => (
                <Space>
                    <Button
                        type="primary"
                        icon={<EyeOutlined />}
                        onClick={() => handleViewOrder(record)}
                    >
                        Chi tiết
                    </Button>
                    <Select
                        defaultValue={record.status}
                        style={{ width: 120 }}
                        onChange={(value) => handleUpdateStatus(record.order_id, value)}
                    >
                        <Option value="pending">Chờ xử lý</Option>
                        <Option value="processing">Đang xử lý</Option>
                        <Option value="shipped">Đang giao hàng</Option>
                        <Option value="delivered">Đã giao hàng</Option>
                        <Option value="cancelled">Đã hủy</Option>
                    </Select>
                </Space>
            )
        }
    ];

    return (
        <div className="container mx-auto px-4 py-8">
            <Card title="Quản lý đơn hàng">
                <Table
                    columns={columns}
                    dataSource={orders}
                    rowKey={(record) => `order-${record.order_id}-${record.uniqueIndex}`}
                    loading={loading}
                />
            </Card>

            <Modal
                title={`Chi tiết đơn hàng #${selectedOrder?.order_id}`}
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={null}
                width={800}
            >
                {selectedOrder && (
                    <div>
                        <p><strong>Khách hàng:</strong> {selectedOrder.username}</p>
                        <p><strong>Ngày đặt:</strong> {new Date(selectedOrder.order_date).toLocaleDateString('vi-VN')}</p>
                        <p><strong>Địa chỉ giao hàng:</strong> {selectedOrder.shipping_address}</p>
                        <p><strong>Tổng tiền:</strong> {new Intl.NumberFormat('vi-VN', {
                            style: 'currency',
                            currency: 'VND'
                        }).format(selectedOrder.total_amount)}</p>
                        <p><strong>Trạng thái:</strong> <Tag color={getStatusColor(selectedOrder.status)}>
                            {getStatusText(selectedOrder.status)}
                        </Tag></p>

                        <h3>Chi tiết sản phẩm</h3>
                        <Table
                            columns={[
                                {
                                    title: 'Sản phẩm',
                                    dataIndex: 'name',
                                    key: 'name',
                                },
                                {
                                    title: 'Số lượng',
                                    dataIndex: 'quantity',
                                    key: 'quantity',
                                },
                                {
                                    title: 'Đơn giá',
                                    dataIndex: 'price',
                                    key: 'price',
                                    render: (price) => new Intl.NumberFormat('vi-VN', {
                                        style: 'currency',
                                        currency: 'VND'
                                    }).format(price)
                                },
                                {
                                    title: 'Thành tiền',
                                    key: 'total',
                                    render: (_, record) => new Intl.NumberFormat('vi-VN', {
                                        style: 'currency',
                                        currency: 'VND'
                                    }).format(record.price * record.quantity)
                                }
                            ]}
                            dataSource={selectedOrder.details}
                            rowKey={(record) => `detail-${record.order_detail_id}-${record.product_id}`}
                            pagination={false}
                        />
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default OrderManagement; 