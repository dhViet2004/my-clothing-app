import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Tag, Space, Button, Modal, message } from 'antd';
import { EditOutlined, DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';

const { confirm } = Modal;

const ProductList = ({ searchQuery, refreshKey, setRefreshKey }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [deleteLoadingId, setDeleteLoadingId] = useState(null);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
    });

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const response = await axios.get('http://localhost:8080/products', {
                params: {
                    search: searchQuery,
                    page: pagination.current,
                    pageSize: pagination.pageSize
                }
            });
            setProducts(response.data);
        } catch (error) {
            console.error('Lỗi khi lấy sản phẩm:', error);
            message.error('Không thể tải danh sách sản phẩm');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, [searchQuery, pagination, refreshKey]);

    const showDeleteConfirm = (productId) => {
        confirm({
            title: 'Xác nhận xóa sản phẩm',
            icon: <ExclamationCircleOutlined />,
            content: 'Bạn có chắc chắn muốn xóa sản phẩm này?',
            okText: 'Xóa',
            okType: 'danger',
            cancelText: 'Hủy',
            onOk() {
                return handleDelete(productId);
            },
        });
    };

    const handleDelete = async (productId) => {
        setDeleteLoadingId(productId);
        try {
            await axios.delete(`http://localhost:8080/products/${productId}`);
            message.success('Xóa sản phẩm thành công');
            setRefreshKey(prev => prev + 1);
        } catch (error) {
            console.error('Lỗi khi xóa sản phẩm:', error);
            message.error('Xóa sản phẩm thất bại');
        } finally {
            setDeleteLoadingId(null);
        }
    };

    const columns = [
        {
            title: 'Tên sản phẩm',
            dataIndex: 'name',
            key: 'name',
            render: (text) => <span className="font-medium">{text}</span>,
        },
        {
            title: 'Danh mục',
            dataIndex: 'category',
            key: 'category',
            render: (category) => <Tag color="blue">{category}</Tag>,
        },
        {
            title: 'Giá',
            dataIndex: 'price',
            key: 'price',
            render: (price) => (
                <span className="font-semibold">
                    {new Intl.NumberFormat('vi-VN', { 
                        style: 'currency', 
                        currency: 'VND' 
                    }).format(price)}
                </span>
            ),
        },
        {
            title: 'Tồn kho',
            dataIndex: 'stock_quantity',
            key: 'stock_quantity',
            render: (quantity) => (
                <Tag color={quantity > 0 ? 'green' : 'red'}>
                    {quantity > 0 ? `Còn ${quantity}` : 'Hết hàng'}
                </Tag>
            ),
        },
        {
            title: 'Thao tác',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <Button 
                        icon={<EditOutlined />}
                        onClick={() => console.log('Edit:', record.product_id)}
                    />
                    <Button 
                        danger 
                        icon={<DeleteOutlined />}
                        onClick={() => showDeleteConfirm(record.product_id)}
                        loading={deleteLoadingId === record.product_id}
                    />
                </Space>
            ),
        },
    ];

    return (
        <Table
            columns={columns}
            dataSource={products}
            rowKey="product_id"
            loading={loading}
            pagination={{
                ...pagination,
                showSizeChanger: true,
                pageSizeOptions: ['10', '20', '50'],
                showTotal: (total) => `Tổng ${total} sản phẩm`,
            }}
            onChange={(newPagination) => setPagination(newPagination)}
            scroll={{ x: true }}
        />
    );
};

export default ProductList;